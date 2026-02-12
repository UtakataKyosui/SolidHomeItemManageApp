import { createAsync, useParams, A, type RouteDefinition } from "@solidjs/router";
import { Show, For } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getBox } from "~/api/box";
import { getBoxItems } from "~/api/item-box";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";
import * as Table from "~/components/ui/table";
import { Pencil } from "lucide-solid";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function BoxDetail() {
  const params = useParams();
  const box = createAsync(() => getBox(Number(params.id)));
  const items = createAsync(() => getBoxItems(Number(params.id)));

  return (
    <div class={css({ width: { base: "95%", md: "80%" }, margin: "0 auto", py: "6" })}>
      <Show when={box()}>
        {(b) => (
          <>
            <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
              <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>{b().name}</h1>
              <Button asChild={(props) => <A {...props()} />} href={`/boxes/${b().id}/edit`} variant="outline">
                <Pencil size={16} /> 編集
              </Button>
            </div>

            <Card.Root>
              <Card.Header>
                <Card.Title>格納アイテム</Card.Title>
              </Card.Header>
              <Card.Body>
                <Show
                  when={items() && items()!.length > 0}
                  fallback={
                    <p class={css({ color: "fg.muted", textStyle: "sm" })}>このボックスにはアイテムがありません。</p>
                  }
                >
                  <div class={css({ overflowX: "auto" })}>
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
                  </div>
                </Show>
              </Card.Body>
            </Card.Root>
          </>
        )}
      </Show>
    </div>
  );
}
