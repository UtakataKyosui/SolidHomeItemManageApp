import { createAsync, useSubmission, useNavigate, action, query, type RouteDefinition } from "@solidjs/router";
import { Show, For, createSignal, createEffect } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getAccessibleObjects, getUserConfig, setupDatabase } from "~/api/setup/server";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";
import { PageContainer } from "~/components/ui/container";

const getObjectsQuery = query(getAccessibleObjects, "accessibleObjects");
const getUserConfigQuery = query(getUserConfig, "userConfig");
const setupDbAction = action(setupDatabase, "setupDatabase");

export const route = {
  preload() {
    getUser();
    getUserConfigQuery();
    getObjectsQuery();
  },
} satisfies RouteDefinition;

export default function Setup() {
  const user = createAsync(() => getUser(), { deferStream: true });
  const config = createAsync(() => getUserConfigQuery());
  const objects = createAsync(() => getObjectsQuery());
  const submission = useSubmission(setupDbAction);
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = createSignal("");

  // 既にセットアップ済みならダッシュボードへリダイレクト
  createEffect(() => {
    if (config()?.notionDbId) {
      navigate("/dashboard", { replace: true });
    }
  });

  const selectedObject = () => (objects() ?? []).find((o) => o.id === selectedId());

  const errorMessage = () => {
    const result = submission.result;
    if (result instanceof Error) return result.message;
    return null;
  };

  const buttonLabel = () => {
    if (submission.pending) return "セットアップ中...";
    const obj = selectedObject();
    if (!obj) return "選択してください";
    return obj.object === "database"
      ? "このデータベースにプロパティを設定する"
      : "このページにデータベースを作成する";
  };

  return (
    <PageContainer>
      <h1 class={css({ textStyle: "2xl", fontWeight: "bold", mb: "2" })}>
        Notion データベースのセットアップ
      </h1>
      <p class={css({ color: "fg.muted", textStyle: "sm", mb: "6" })}>
        ログイン時にアクセスを許可したページまたはデータベースを選択してください。
      </p>

      <Show when={errorMessage()}>
        <div class={css({ bg: "red.3", color: "red.11", p: "3", borderRadius: "l2", textStyle: "sm", mb: "4" })}>
          {errorMessage()}
        </div>
      </Show>

      <Card.Root class={css({ mb: "4" })}>
        <Card.Header>
          <Card.Title>セットアップ先を選択</Card.Title>
        </Card.Header>
        <Card.Body>
          <Show
            when={objects() && objects()!.length > 0}
            fallback={
              <div class={css({ display: "flex", flexDirection: "column", gap: "3", textStyle: "sm" })}>
                <p class={css({ color: "fg.muted" })}>
                  アクセス可能なページ・データベースが見つかりませんでした。
                </p>
                <div class={css({ bg: "gray.3", p: "3", borderRadius: "l2" })}>
                  <p class={css({ fontWeight: "semibold", mb: "2" })}>対処方法:</p>
                  <ol class={css({ pl: "4", display: "flex", flexDirection: "column", gap: "1", color: "fg.muted" })}>
                    <li>ログインし直して、Notion のページまたはデータベースへのアクセスを許可してください</li>
                  </ol>
                </div>
              </div>
            }
          >
            <form action={setupDbAction} method="post" class={css({ display: "flex", flexDirection: "column", gap: "4" })}>
              <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                <For each={objects()}>
                  {(obj) => (
                    <label
                      class={css({
                        display: "flex", alignItems: "center", gap: "3",
                        p: "3", borderWidth: "1px", borderRadius: "l2", cursor: "pointer",
                        borderColor: selectedId() === obj.id ? "accent.default" : "border.default",
                        bg: selectedId() === obj.id ? "accent.subtle" : "transparent",
                        _hover: { bg: "gray.subtle.bg" },
                        transition: "all 0.15s",
                      })}
                    >
                      <input
                        type="radio"
                        name="objectId"
                        value={obj.id}
                        checked={selectedId() === obj.id}
                        onChange={() => setSelectedId(obj.id)}
                        class={css({ cursor: "pointer" })}
                      />
                      <div>
                        <p class={css({ fontWeight: "medium", textStyle: "sm" })}>
                          <span class={css({
                            bg: obj.object === "page" ? "blue.3" : "green.3",
                            color: obj.object === "page" ? "blue.11" : "green.11",
                            px: "1.5", py: "0.5", borderRadius: "l1", fontSize: "xs", mr: "2",
                          })}>
                            {obj.object === "page" ? "ページ" : "データベース"}
                          </span>
                          {obj.title}
                        </p>
                        <p class={css({ color: "fg.muted", fontFamily: "mono", fontSize: "xs" })}>{obj.id}</p>
                      </div>
                    </label>
                  )}
                </For>
              </div>

              <Show when={selectedObject()}>
                <div class={css({ bg: "gray.3", p: "3", borderRadius: "l2", textStyle: "sm", color: "fg.muted" })}>
                  {selectedObject()!.object === "database"
                    ? "選択したデータベースに必要なプロパティを追加します。既存データはそのまま残ります。"
                    : "選択したページ内に「Home Clean Manage」データベースを新規作成します。"}
                </div>
              </Show>

              <Button type="submit" disabled={!selectedId() || submission.pending}>
                {buttonLabel()}
              </Button>
            </form>
          </Show>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Title>自動設定されるプロパティ</Card.Title>
        </Card.Header>
        <Card.Body>
          <div class={css({ overflowX: "auto" })}>
            <table class={css({ width: "100%", borderCollapse: "collapse", textStyle: "sm" })}>
              <thead>
                <tr class={css({ borderBottomWidth: "1px", borderColor: "border.default" })}>
                  <th class={css({ textAlign: "left", py: "2", px: "3", fontWeight: "semibold" })}>プロパティ</th>
                  <th class={css({ textAlign: "left", py: "2", px: "3", fontWeight: "semibold" })}>種類</th>
                  <th class={css({ textAlign: "left", py: "2", px: "3", fontWeight: "semibold" })}>用途</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Name", "タイトル", "名前"],
                  ["Type", "セレクト", "Item / Category / Storage / Box の区別"],
                  ["Description", "テキスト", "説明文"],
                  ["Price", "数値 (円)", "価格"],
                  ["Quantity", "数値", "数量"],
                  ["Image", "URL", "画像"],
                  ["Categories", "リレーション", "カテゴリとの紐付け"],
                  ["Boxes", "リレーション", "ボックスとの紐付け"],
                  ["Storage", "リレーション", "収納場所との紐付け"],
                ].map(([name, type, desc]) => (
                  <tr class={css({ borderBottomWidth: "1px", borderColor: "border.default" })}>
                    <td class={css({ py: "1.5", px: "3" })}>
                      <code class={css({ bg: "gray.3", px: "1", py: "0.5", borderRadius: "l1", fontFamily: "mono", fontSize: "xs" })}>
                        {name}
                      </code>
                    </td>
                    <td class={css({ py: "1.5", px: "3" })}>{type}</td>
                    <td class={css({ py: "1.5", px: "3", color: "fg.muted" })}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card.Root>
    </PageContainer>
  );
}
