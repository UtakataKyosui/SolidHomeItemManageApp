import { createAsync, A, type RouteDefinition } from "@solidjs/router";
import { Show, For } from "solid-js";
import { css } from "styled-system/css";
import { getUser, logout } from "~/api";
import { getDashboardStats } from "~/api/dashboard";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";
import { Package, FolderOpen, Archive, Box } from "lucide-solid";

export const route = {
  preload() {
    getUser();
    getDashboardStats();
  },
} satisfies RouteDefinition;

import { PageContainer } from "~/components/ui/container";
import { performAutoSetup } from "~/api/setup/server";
import { createEffect, createSignal } from "solid-js";

export default function Dashboard() {
  const user = createAsync(() => getUser(), { deferStream: true });
  const stats = createAsync(() => getDashboardStats());
  const [isSettingUp, setIsSettingUp] = createSignal(false);

  createEffect(async () => {
    const s = stats();
    if (s && 'needsSetup' in s && s.needsSetup && !isSettingUp()) {
      setIsSettingUp(true);
      try {
        await performAutoSetup();
        window.location.reload();
      } catch (e) {
        console.error(e);
        alert("自動セットアップに失敗しました。");
        setIsSettingUp(false);
      }
    }
  });

  return (
    <PageContainer>
      <Show when={isSettingUp()}>
        <div class={css({
          position: "fixed", inset: 0, bg: "rgba(255,255,255,0.9)",
          zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center",
          flexDirection: "column", gap: "4"
        })}>
          <div class={css({ fontSize: "2xl", fontWeight: "bold" })}>ワークスペースをセットアップ中...</div>
          <div>Notion に必要なデータベースを作成しています。</div>
        </div>
      </Show>

      <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "6" })}>
        <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>
          <p>Welcome back, {user()?.name}!</p>
        </h1>
        <form action={logout} method="post">
          <Button type="submit" variant="outline">ログアウト</Button>
        </form>
      </div>

      <Show when={stats() && !isSettingUp()}>
        <div class={css({ display: "flex", flexDirection: "column", gap: "4" })}>
          {/* 統計カード */}
          <div class={css({ display: "grid", gridTemplateColumns: { base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: "4" })}>
            <A href="/items" class={css({ textDecoration: "none" })} aria-label="アイテム">
              <Card.Root>
                <Card.Header>
                  <div class={css({ display: "flex", alignItems: "center", gap: "2", justifyContent: "center" })}>
                    <Package size={20} />
                    <Card.Title class={css({ display: { base: "none", md: "block" } })}>アイテム</Card.Title>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p class={css({ textStyle: "3xl", fontWeight: "bold" })}>{stats()?.itemCount ?? 0}</p>
                </Card.Body>
              </Card.Root>
            </A>

            <A href="/categories" class={css({ textDecoration: "none" })} aria-label="カテゴリ">
              <Card.Root>
                <Card.Header>
                  <div class={css({ display: "flex", alignItems: "center", gap: "2", justifyContent: "center" })}>
                    <FolderOpen size={20} />
                    <Card.Title class={css({ display: { base: "none", md: "block" } })}>カテゴリ</Card.Title>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p class={css({ textStyle: "3xl", fontWeight: "bold" })}>{stats()?.categoryCount ?? 0}</p>
                </Card.Body>
              </Card.Root>
            </A>

            <A href="/boxes" class={css({ textDecoration: "none" })} aria-label="ボックス">
              <Card.Root>
                <Card.Header>
                  <div class={css({ display: "flex", alignItems: "center", gap: "2", justifyContent: "center" })}>
                    <Box size={20} />
                    <Card.Title class={css({ display: { base: "none", md: "block" } })}>ボックス</Card.Title>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p class={css({ textStyle: "3xl", fontWeight: "bold" })}>{stats()?.boxCount ?? 0}</p>
                </Card.Body>
              </Card.Root>
            </A>

            <A href="/storages" class={css({ textDecoration: "none" })} aria-label="収納場所">
              <Card.Root>
                <Card.Header>
                  <div class={css({ display: "flex", alignItems: "center", gap: "2", justifyContent: "center" })}>
                    <Archive size={20} />
                    <Card.Title class={css({ display: { base: "none", md: "block" } })}>収納場所</Card.Title>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p class={css({ textStyle: "3xl", fontWeight: "bold" })}>{stats()?.storageCount ?? 0}</p>
                </Card.Body>
              </Card.Root>
            </A>
          </div>

          {/* 最近のアイテム */}
          <Card.Root>
            <Card.Header>
              <Card.Title>最近追加されたアイテム</Card.Title>
            </Card.Header>
            <Card.Body>
              <Show
                when={stats()?.recentItems && stats()!.recentItems.length > 0}
                fallback={
                  <p class={css({ color: "fg.muted", textStyle: "sm" })}>
                    まだアイテムがありません。
                    <A href="/items/new" class={css({ textDecoration: "underline", ml: "1" })}>最初のアイテムを追加</A>
                  </p>
                }
              >
                <div class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                  <For each={stats()?.recentItems ?? []}>
                    {(item) => (
                      <A
                        href={`/items/${item.id}`}
                        class={css({
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          px: "3", py: "2", borderRadius: "l2", textStyle: "sm",
                          _hover: { bg: "gray.subtle.bg" },
                        })}
                      >
                        <span class={css({ fontWeight: "medium" })}>{item.name}</span>
                        <span class={css({ color: "fg.muted" })}>{item.price.toLocaleString()}円 x {item.quantity}</span>
                      </A>
                    )}
                  </For>
                </div>
              </Show>
            </Card.Body>
          </Card.Root>
        </div>
      </Show>
    </PageContainer>
  );
}
