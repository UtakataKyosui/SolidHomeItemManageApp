import { createAsync, A, useSubmission, type RouteDefinition } from "@solidjs/router";
import { For, Show } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getItems, deleteItem } from "~/api/item";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";
import * as Table from "~/components/ui/table";
import * as Dialog from "~/components/ui/dialog";
import { Pencil, Trash2, Plus, Eye } from "lucide-solid";

export const route = {
  preload() {
    getUser();
    getItems();
  },
} satisfies RouteDefinition;

export default function ItemList() {
  const items = createAsync(() => getItems());
  const deleting = useSubmission(deleteItem);

  return (
    <div class={css({ width: { base: "95%", md: "80%" }, margin: "0 auto", py: "6" })}>
      <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
        <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>アイテム</h1>
        <Button asChild={(props) => <A {...props()} />} href="/items/new">
          <Plus size={16} /> 新規作成
        </Button>
      </div>

      <Show
        when={items() && items()!.length > 0}
        fallback={
          <p class={css({ color: "fg.muted", textAlign: "center", py: "8" })}>
            アイテムがまだありません。「新規作成」から追加してください。
          </p>
        }
      >
        <Table.Container>
          <Table.Root>
            <Table.Head>
              <Table.Row>
                <Table.Header>名前</Table.Header>
                <Table.Header class={css({ display: { base: "none", md: "table-cell" } })}>説明</Table.Header>
                <Table.Header class={css({ display: { base: "none", md: "table-cell" } })}>価格</Table.Header>
                <Table.Header class={css({ display: { base: "none", md: "table-cell" } })}>数量</Table.Header>
                <Table.Header width="150px">操作</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <For each={items()}>
                {(item) => (
                  <Table.Row>
                    <Table.Cell>
                      <A href={`/items/${item.id}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                        {item.name}
                      </A>
                    </Table.Cell>
                    <Table.Cell class={css({ display: { base: "none", md: "table-cell" } })}>{item.description}</Table.Cell>
                    <Table.Cell class={css({ display: { base: "none", md: "table-cell" } })}>{item.price.toLocaleString()}円</Table.Cell>
                    <Table.Cell class={css({ display: { base: "none", md: "table-cell" } })}>{item.quantity}</Table.Cell>
                    <Table.Cell>
                      <div class={css({ display: "flex", gap: "1" })}>
                        <IconButton asChild={(props) => <A {...props()} />} href={`/items/${item.id}`} variant="outline" size="sm">
                          <Eye size={14} />
                        </IconButton>
                        <IconButton asChild={(props) => <A {...props()} />} href={`/items/${item.id}/edit`} variant="outline" size="sm">
                          <Pencil size={14} />
                        </IconButton>
                        <Dialog.Root>
                          <Dialog.Trigger asChild={(props) => (
                            <IconButton {...props()} variant="outline" size="sm" colorPalette="red">
                              <Trash2 size={14} />
                            </IconButton>
                          )} />
                          <Dialog.Backdrop />
                          <Dialog.Positioner>
                            <Dialog.Content>
                              <Dialog.Header>
                                <Dialog.Title>削除確認</Dialog.Title>
                                <Dialog.Description>
                                  「{item.name}」を削除しますか？関連するカテゴリ・収納場所の紐付けも全て削除されます。
                                </Dialog.Description>
                              </Dialog.Header>
                              <Dialog.Footer>
                                <Dialog.CloseTrigger asChild={(props) => (
                                  <Button {...props()} variant="outline">キャンセル</Button>
                                )} />
                                <form action={deleteItem} method="post">
                                  <input type="hidden" name="id" value={item.id} />
                                  <Button type="submit" colorPalette="red">削除</Button>
                                </form>
                              </Dialog.Footer>
                            </Dialog.Content>
                          </Dialog.Positioner>
                        </Dialog.Root>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Root>
        </Table.Container>
      </Show>
    </div>
  );
}
