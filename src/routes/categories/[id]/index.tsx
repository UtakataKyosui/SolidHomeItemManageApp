import { createAsync, useParams, A, type RouteDefinition } from "@solidjs/router";
import { Show, For } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getCategory } from "~/api/category";
import { getCategoryItems } from "~/api/item-category";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";
import * as Table from "~/components/ui/table";
import { Pencil } from "lucide-solid";
import { PageContainer } from "~/components/ui/container";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function CategoryDetail() {
  const params = useParams();
  const category = createAsync(() => getCategory(Number(params.id)));
  const items = createAsync(() => getCategoryItems(Number(params.id)));

  return (
    <PageContainer>
      <Show when={category()}>
        {(c) => (
          <>
            <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
              <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>{c().name}</h1>
              <Button asChild={(props) => <A {...props()} />} href={`/categories/${c().id}/edit`} variant="outline">
                <Pencil size={16} /> 編集
              </Button>
            </div>

            <Card.Root>
              <Card.Header>
                <Card.Title>所属アイテム</Card.Title>
              </Card.Header>
              <Card.Body>
                <Show
                  when={items() && items()!.length > 0}
                  fallback={
                    <p class={css({ color: "fg.muted", textStyle: "sm" })}>このカテゴリにはアイテムがありません。</p>
                  }
                >
                  <Table.Container>
                    <Table.Root>
                      <Table.Head>
                        <Table.Row>
                          <Table.Header>名前</Table.Header>
                          <Table.Header>説明</Table.Header>
                          <Table.Header>価格</Table.Header>
                          <Table.Header>数量</Table.Header>
                        </Table.Row>
                      </Table.Head>
                      <Table.Body>
                        <For each={items()}>
                          {(item) => (
                            <Table.Row>
                              <Table.Cell>
                                <A href={`/items/${item.itemId}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                                  {item.itemName}
                                </A>
                              </Table.Cell>
                              <Table.Cell>{item.itemDescription}</Table.Cell>
                              <Table.Cell>{item.itemPrice.toLocaleString()}円</Table.Cell>
                              <Table.Cell>{item.itemQuantity}</Table.Cell>
                            </Table.Row>
                          )}
                        </For>
                      </Table.Body>
                    </Table.Root>
                  </Table.Container>
                </Show>
              </Card.Body>
            </Card.Root>
          </>
        )}
      </Show>
    </PageContainer>
  );
}
