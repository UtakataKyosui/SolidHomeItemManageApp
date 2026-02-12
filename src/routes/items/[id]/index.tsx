import { createAsync, useParams, A, type RouteDefinition } from "@solidjs/router";
import { Show, For, createSignal } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getItem } from "~/api/item";
import { getItemCategories, assignCategory, removeCategory } from "~/api/item-category";
import { getItemBoxes, assignBox, removeBox } from "~/api/item-box";
import { getAllBoxesWithStorage } from "~/api/box";
import { getCategories } from "~/api/category";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";
import * as Card from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Pencil, X, Plus } from "lucide-solid";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function ItemDetail() {
  const params = useParams();
  const item = createAsync(() => getItem(Number(params.id)));
  const itemCategories = createAsync(() => getItemCategories(Number(params.id)));
  const itemBoxes = createAsync(() => getItemBoxes(Number(params.id)));
  const allCategories = createAsync(() => getCategories());
  const allBoxes = createAsync(() => getAllBoxesWithStorage());

  const [selectedCategoryId, setSelectedCategoryId] = createSignal("");
  const [selectedBoxId, setSelectedBoxId] = createSignal("");

  const availableCategories = () => {
    const assigned = new Set((itemCategories() ?? []).map((c) => c.categoryId));
    return (allCategories() ?? []).filter((c) => !assigned.has(c.id));
  };

  const availableBoxes = () => {
    const assigned = new Set((itemBoxes() ?? []).map((b) => b.boxId));
    return (allBoxes() ?? []).filter((b) => !assigned.has(b.id));
  };

  return (
    <div class={css({ width: "80%", margin: "0 auto", py: "6" })}>
      <Show when={item()}>
        {(i) => (
          <>
            <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
              <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>{i().name}</h1>
              <Button asChild={(props) => <A {...props()} />} href={`/items/${i().id}/edit`} variant="outline">
                <Pencil size={16} /> 編集
              </Button>
            </div>

            <div class={css({ display: "flex", flexDirection: "column", gap: "4" })}>
              {/* 基本情報 */}
              <Card.Root>
                <Card.Header>
                  <Card.Title>基本情報</Card.Title>
                </Card.Header>
                <Card.Body>
                  <dl class={css({ display: "grid", gridTemplateColumns: "120px 1fr", gap: "2", textStyle: "sm" })}>
                    <dt class={css({ color: "fg.muted", fontWeight: "medium" })}>名前</dt>
                    <dd>{i().name}</dd>
                    <dt class={css({ color: "fg.muted", fontWeight: "medium" })}>説明</dt>
                    <dd>{i().description || "—"}</dd>
                    <dt class={css({ color: "fg.muted", fontWeight: "medium" })}>価格</dt>
                    <dd>{i().price.toLocaleString()}円</dd>
                    <dt class={css({ color: "fg.muted", fontWeight: "medium" })}>数量</dt>
                    <dd>{i().quantity}</dd>
                  </dl>
                </Card.Body>
              </Card.Root>

              {/* カテゴリ */}
              <Card.Root>
                <Card.Header>
                  <Card.Title>カテゴリ</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div class={css({ display: "flex", flexWrap: "wrap", gap: "2", mb: "3" })}>
                    <For each={itemCategories()} fallback={
                      <p class={css({ color: "fg.muted", textStyle: "sm" })}>まだカテゴリが割り当てられていません。</p>
                    }>
                      {(cat) => (
                        <div class={css({ display: "flex", alignItems: "center", gap: "1" })}>
                          <Badge variant="surface">
                            <A href={`/categories/${cat.categoryId}`} class={css({ textDecoration: "none" })}>
                              {cat.categoryName}
                            </A>
                          </Badge>
                          <form action={removeCategory} method="post">
                            <input type="hidden" name="relationId" value={cat.relationId} />
                            <input type="hidden" name="itemId" value={i().id} />
                            <IconButton type="submit" variant="plain" size="2xs">
                              <X size={12} />
                            </IconButton>
                          </form>
                        </div>
                      )}
                    </For>
                  </div>
                  <Show when={availableCategories().length > 0}>
                    <form action={assignCategory} method="post" class={css({ display: "flex", gap: "2", alignItems: "end" })}>
                      <input type="hidden" name="itemId" value={i().id} />
                      <select
                        name="categoryId"
                        value={selectedCategoryId()}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        class={css({
                          borderWidth: "1px", borderRadius: "l2", px: "3", py: "2",
                          textStyle: "sm", bg: "transparent", cursor: "pointer",
                        })}
                      >
                        <option value="">カテゴリを選択...</option>
                        <For each={availableCategories()}>
                          {(cat) => <option value={cat.id}>{cat.name}</option>}
                        </For>
                      </select>
                      <Button type="submit" size="sm" disabled={!selectedCategoryId()}>
                        <Plus size={14} /> 追加
                      </Button>
                    </form>
                  </Show>
                </Card.Body>
              </Card.Root>

              {/* ボックス */}
              <Card.Root>
                <Card.Header>
                  <Card.Title>ボックス</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div class={css({ display: "flex", flexWrap: "wrap", gap: "2", mb: "3" })}>
                    <For each={itemBoxes()} fallback={
                      <p class={css({ color: "fg.muted", textStyle: "sm" })}>まだボックスが割り当てられていません。</p>
                    }>
                      {(box) => (
                        <div class={css({ display: "flex", alignItems: "center", gap: "1" })}>
                          <Badge variant="surface" colorPalette="green">
                            <A href={`/boxes/${box.boxId}`} class={css({ textDecoration: "none" })}>
                              {box.storageName} &gt; {box.boxName}
                            </A>
                          </Badge>
                          <form action={removeBox} method="post">
                            <input type="hidden" name="relationId" value={box.relationId} />
                            <input type="hidden" name="itemId" value={i().id} />
                            <IconButton type="submit" variant="plain" size="2xs">
                              <X size={12} />
                            </IconButton>
                          </form>
                        </div>
                      )}
                    </For>
                  </div>
                  <Show when={availableBoxes().length > 0}>
                    <form action={assignBox} method="post" class={css({ display: "flex", gap: "2", alignItems: "end" })}>
                      <input type="hidden" name="itemId" value={i().id} />
                      <select
                        name="boxId"
                        value={selectedBoxId()}
                        onChange={(e) => setSelectedBoxId(e.target.value)}
                        class={css({
                          borderWidth: "1px", borderRadius: "l2", px: "3", py: "2",
                          textStyle: "sm", bg: "transparent", cursor: "pointer",
                        })}
                      >
                        <option value="">ボックスを選択...</option>
                        <For each={availableBoxes()}>
                          {(box) => <option value={box.id}>{box.storageName} &gt; {box.name}</option>}
                        </For>
                      </select>
                      <Button type="submit" size="sm" disabled={!selectedBoxId()}>
                        <Plus size={14} /> 追加
                      </Button>
                    </form>
                  </Show>
                </Card.Body>
              </Card.Root>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
