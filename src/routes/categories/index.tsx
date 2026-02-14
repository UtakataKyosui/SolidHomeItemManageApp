import { createAsync, A, useSubmission, type RouteDefinition } from "@solidjs/router";
import { For, Show } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getCategories, deleteCategory } from "~/api/category";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";
import * as Table from "~/components/ui/table";
import * as Dialog from "~/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-solid";
import { PageContainer } from "~/components/ui/container";

export const route = {
  preload() {
    getUser();
    getCategories();
  },
} satisfies RouteDefinition;

export default function CategoryList() {
  const categories = createAsync(() => getCategories());
  const deleting = useSubmission(deleteCategory);

  return (
    <PageContainer>
      <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
        <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>カテゴリ</h1>
        <Button asChild={(props) => <A {...props()} href="/categories/new" />}>
          <Plus size={16} /> 新規作成
        </Button>
      </div>

      <Show
        when={categories() && categories()!.length > 0}
        fallback={
          <p class={css({ color: "fg.muted", textAlign: "center", py: "8" })}>
            カテゴリがまだありません。「新規作成」から追加してください。
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
              <For each={categories()}>
                {(category) => (
                  <Table.Row>
                    <Table.Cell>
                      <A href={`/categories/${category.id}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                        {category.name}
                      </A>
                    </Table.Cell>
                    <Table.Cell>
                      <div class={css({ display: "flex", gap: "1" })}>
                        <IconButton asChild={(props) => <A {...props()} href={`/categories/${category.id}/edit`} />} variant="outline" size="sm">
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
                                  「{category.name}」を削除しますか？この操作は取り消せません。
                                </Dialog.Description>
                              </Dialog.Header>
                              <Dialog.Footer>
                                <Dialog.CloseTrigger asChild={(props) => (
                                  <Button {...props()} variant="outline">キャンセル</Button>
                                )} />
                                <form action={deleteCategory} method="post">
                                  <input type="hidden" name="id" value={category.id} />
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
