import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";
import * as Table from "~/components/ui/table";
import * as Dialog from "~/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-solid";
import { PageContainer } from "~/components/ui/container";
import type { Storage } from "./types";
import { deleteStorage } from "./index";

type StorageListProps = {
  items: () => Storage[] | undefined;
};

export function StorageList(props: StorageListProps) {
  return (
    <PageContainer>
      <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
        <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>収納場所</h1>
        <Button asChild={(btnProps) => <A {...btnProps()} href="/storages/new" />}>
          <Plus size={16} /> 新規作成
        </Button>
      </div>

      <Show
        when={props.items() && props.items()!.length > 0}
        fallback={
          <p class={css({ color: "fg.muted", textAlign: "center", py: "8" })}>
            収納場所がまだありません。「新規作成」から追加してください。
          </p>
        }
      >
        <Table.Container>
          <Table.Root>
            <Table.Head>
              <Table.Row>
                <Table.Header>名前</Table.Header>
                <Table.Header width="120px">操作</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <For each={props.items()}>
                {(storage) => (
                  <Table.Row>
                    <Table.Cell>
                      <A href={`/storages/${storage.id}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                        {storage.name}
                      </A>
                    </Table.Cell>
                    <Table.Cell>
                      <div class={css({ display: "flex", gap: "1" })}>
                        <IconButton asChild={(btnProps) => <A {...btnProps()} href={`/storages/${storage.id}/edit`} />} variant="outline" size="sm">
                          <Pencil size={14} />
                        </IconButton>
                        <Dialog.Root>
                          <Dialog.Trigger asChild={(btnProps) => (
                            <IconButton {...btnProps()} variant="outline" size="sm" colorPalette="red">
                              <Trash2 size={14} />
                            </IconButton>
                          )} />
                          <Dialog.Backdrop />
                          <Dialog.Positioner>
                            <Dialog.Content>
                              <Dialog.Header>
                                <Dialog.Title>削除確認</Dialog.Title>
                                <Dialog.Description>
                                  「{storage.name}」を削除しますか？この操作は取り消せません。
                                </Dialog.Description>
                              </Dialog.Header>
                              <Dialog.Footer>
                                <Dialog.CloseTrigger asChild={(btnProps) => (
                                  <Button {...btnProps()} variant="outline">キャンセル</Button>
                                )} />
                                <form action={deleteStorage} method="post">
                                  <input type="hidden" name="id" value={storage.id} />
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
    </PageContainer>
  );
}
