import { createAsync, useParams, A, type RouteDefinition } from "@solidjs/router";
import { Show, For } from "solid-js";
import { css } from "styled-system/css";
import { getUser } from "~/api";
import { getStorage } from "~/api/storage";
import { getStorageBoxesWithItems } from "~/api/item-box";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import * as Card from "~/components/ui/card";
import * as Table from "~/components/ui/table";
import { Pencil } from "lucide-solid";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function StorageDetail() {
  const params = useParams();
  const storage = createAsync(() => getStorage(Number(params.id)));
  const boxesWithItems = createAsync(() => getStorageBoxesWithItems(Number(params.id)));

  return (
    <div class={css({ width: { base: "95%", md: "80%" }, margin: "0 auto", py: "6" })}>
      <Show when={storage()}>
        {(s) => (
          <>
            <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
              <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>{s().name}</h1>
              <Button asChild={(props) => <A {...props()} />} href={`/storages/${s().id}/edit`} variant="outline">
                <Pencil size={16} /> 編集
              </Button>
            </div>

            <div class={css({ display: "flex", flexDirection: "column", gap: "4" })}>
              <For each={boxesWithItems()} fallback={
                <Card.Root>
                  <Card.Body>
                    <p class={css({ color: "fg.muted", textStyle: "sm" })}>この収納場所にはボックスがありません。</p>
                  </Card.Body>
                </Card.Root>
              }>
                {(box) => (
                  <Card.Root>
                    <Card.Header>
                      <div class={css({ display: "flex", alignItems: "center", gap: "2" })}>
                        <Card.Title>
                          <A href={`/boxes/${box.id}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                            {box.name}
                          </A>
                        </Card.Title>
                        <Show when={box.isDefault}>
                          <Badge variant="surface" size="sm">デフォルト</Badge>
                        </Show>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Show
                        when={box.items.length > 0}
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
                              <For each={box.items}>
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
                )}
              </For>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
