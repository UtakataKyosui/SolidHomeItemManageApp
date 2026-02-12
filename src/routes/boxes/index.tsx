import { createAsync, A, type RouteDefinition } from "@solidjs/router";
import { For, Show } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getAllBoxesWithStorage, deleteBox } from "~/api/box";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";
import * as Table from "~/components/ui/table";
import * as Dialog from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-solid";

export const route = {
  preload() {
    getUser();
    getAllBoxesWithStorage();
  },
} satisfies RouteDefinition;

export default function BoxList() {
  const boxes = createAsync(() => getAllBoxesWithStorage());

  return (
    <div class={css({ width: "80%", margin: "0 auto", py: "6" })}>
      <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
        <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>ボックス</h1>
        <Button asChild={(props) => <A {...props()} />} href="/boxes/new">
          <Plus size={16} /> 新規作成
        </Button>
      </div>

      <Show
        when={boxes() && boxes()!.length > 0}
        fallback={
          <p class={css({ color: "fg.muted", textAlign: "center", py: "8" })}>
            ボックスがまだありません。「新規作成」から追加してください。
          </p>
        }
      >
        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.Header>名前</Table.Header>
              <Table.Header>収納場所</Table.Header>
              <Table.Header width="120px">操作</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <For each={boxes()}>
              {(box) => (
                <Table.Row>
                  <Table.Cell>
                    <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
                      <A href={`/boxes/${box.id}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                        {box.name}
                      </A>
                      <Show when={box.isDefault}>
                        <Badge variant="surface" size="sm">デフォルト</Badge>
                      </Show>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <A href={`/storages/${box.storageId}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                      {box.storageName}
                    </A>
                  </Table.Cell>
                  <Table.Cell>
                    <div class={css({ display: "flex", gap: "1" })}>
                      <IconButton asChild={(props) => <A {...props()} />} href={`/boxes/${box.id}/edit`} variant="outline" size="sm">
                        <Pencil size={14} />
                      </IconButton>
                      <Show when={!box.isDefault}>
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
                                  「{box.name}」を削除しますか？この操作は取り消せません。
                                </Dialog.Description>
                              </Dialog.Header>
                              <Dialog.Footer>
                                <Dialog.CloseTrigger asChild={(props) => (
                                  <Button {...props()} variant="outline">キャンセル</Button>
                                )} />
                                <form action={deleteBox} method="post">
                                  <input type="hidden" name="id" value={box.id} />
                                  <Button type="submit" colorPalette="red">削除</Button>
                                </form>
                              </Dialog.Footer>
                            </Dialog.Content>
                          </Dialog.Positioner>
                        </Dialog.Root>
                      </Show>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </For>
          </Table.Body>
        </Table.Root>
      </Show>
    </div>
  );
}
