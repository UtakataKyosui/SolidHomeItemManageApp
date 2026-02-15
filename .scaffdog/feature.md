---
name: "feature"
root: "src"
output: "."
questions:
  name:
    message: "機能名を入力してください（例: item, box, storage）"
  entity:
    message: "エンティティの日本語名を入力してください（例: アイテム, ボックス, ストレージ）"
  hasHandlers:
    confirm: "サーバーハンドラー（CRUD）を生成しますか？"
    initial: true
  hasList:
    confirm: "一覧コンポーネントを生成しますか？"
    initial: true
  hasForm:
    confirm: "フォームコンポーネントを生成しますか？"
    initial: true
  hasDetail:
    confirm: "詳細コンポーネントを生成しますか？"
    initial: false
---

# Variables

- feature: `<% inputs.name | camel %>`
- Feature: `<% inputs.name | pascal %>`
- entity: `<% inputs.entity %>`

# `features/<% feature %>/types.ts`

```ts
export interface <% Feature %> {
  id: string;
  name: string;
  description: string;
  userId: string;
}

export interface Create<% Feature %>Input {
  name: string;
  description: string;
}

export interface Update<% Feature %>Input {
  id: string;
  name: string;
  description: string;
}

export function parse<% Feature %>Form(formData: FormData): Create<% Feature %>Input {
  return {
    name: String(formData.get("name")),
    description: String(formData.get("description") ?? ""),
  };
}
```

# `<% inputs.hasHandlers ? "" : "!" %>features/<% feature %>/handlers.ts`

```ts
"use server";
import { redirect } from "@solidjs/router";
import { getUserNotionClient } from "~/lib/notion";
import { getUser } from "~/api/server";
import { getUserConfig } from "~/api/setup/server";
import type { <% Feature %> } from "./types";
import { parse<% Feature %>Form } from "./types";

export async function get<% Feature %>s(): Promise<<% Feature %>[]> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) return [];

  const response = await notion.databases.query({
    database_id: config.notionDbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: user.id } },
        { property: "Type", select: { equals: "<% Feature %>" } },
      ],
    },
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: page.properties.Name.title[0]?.plain_text ?? "",
    description: page.properties.Description.rich_text[0]?.plain_text ?? "",
    userId: page.properties.UserId.rich_text[0]?.plain_text ?? "",
  }));
}

export async function get<% Feature %>(id: string): Promise<<% Feature %>> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    const pageUserId = page.properties.UserId.rich_text[0]?.plain_text ?? "";
    if (pageUserId !== user.id) {
      throw redirect("/<% feature %>s");
    }

    return {
      id: page.id,
      name: page.properties.Name.title[0]?.plain_text ?? "",
      description: page.properties.Description.rich_text[0]?.plain_text ?? "",
      userId: pageUserId,
    };
  } catch (e) {
    throw redirect("/<% feature %>s");
  }
}

export async function create<% Feature %>(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) throw redirect("/dashboard");

  const input = parse<% Feature %>Form(formData);

  if (!input.name || input.name.trim() === "") {
    return new Error("<% entity %>名を入力してください");
  }

  await notion.pages.create({
    parent: { database_id: config.notionDbId },
    properties: {
      Name: { title: [{ text: { content: input.name.trim() } }] },
      Type: { select: { name: "<% Feature %>" } },
      Description: { rich_text: [{ text: { content: input.description.trim() } }] },
      UserId: { rich_text: [{ text: { content: user.id } }] },
    },
  });
  throw redirect("/<% feature %>s");
}

export async function update<% Feature %>(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const id = String(formData.get("id"));
  const input = parse<% Feature %>Form(formData);

  if (!input.name || input.name.trim() === "") {
    return new Error("<% entity %>名を入力してください");
  }

  await notion.pages.update({
    page_id: id,
    properties: {
      Name: { title: [{ text: { content: input.name.trim() } }] },
      Description: { rich_text: [{ text: { content: input.description.trim() } }] },
    },
  });
  throw redirect("/<% feature %>s");
}

export async function delete<% Feature %>(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const id = String(formData.get("id"));

  await notion.pages.update({
    page_id: id,
    archived: true,
  });
  throw redirect("/<% feature %>s");
}
```

# `features/<% feature %>/hooks.ts`

```ts
import { createAsync, useSubmission } from "@solidjs/router";
<% inputs.hasHandlers ? "import { get" + Feature + "s, get" + Feature + ", delete" + Feature + ' } from "./handlers";' : "" %>

export function use<% Feature %>List() {
  const items = createAsync(() => get<% Feature %>s());
  const deleting = useSubmission(delete<% Feature %>);

  return { items, deleting };
}

export function use<% Feature %>Detail(id: () => string) {
  const item = createAsync(() => get<% Feature %>(id()));

  return { item };
}
```

# `<% inputs.hasList ? "" : "!" %>features/<% feature %>/<% Feature %>List.tsx`

```tsx
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";
import * as Table from "~/components/ui/table";
import * as Dialog from "~/components/ui/dialog";
import { Pencil, Trash2, Plus, Eye } from "lucide-solid";
import { PageContainer } from "~/components/ui/container";
import type { <% Feature %> } from "./types";
<% inputs.hasHandlers ? "import { delete" + Feature + ' } from "./handlers";' : "" %>

type <% Feature %>ListProps = {
  items: () => <% Feature %>[] | undefined;
};

export function <% Feature %>List(props: <% Feature %>ListProps) {
  return (
    <PageContainer>
      <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
        <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}><% entity %></h1>
        <Button asChild={(btnProps) => <A {...btnProps()} href="/<% feature %>s/new" />}>
          <Plus size={16} /> 新規作成
        </Button>
      </div>

      <Show
        when={props.items() && props.items()!.length > 0}
        fallback={
          <p class={css({ color: "fg.muted", textAlign: "center", py: "8" })}>
            <% entity %>がまだありません。「新規作成」から追加してください。
          </p>
        }
      >
        <Table.Container>
          <Table.Root>
            <Table.Head>
              <Table.Row>
                <Table.Header>名前</Table.Header>
                <Table.Header class={css({ display: { base: "none", md: "table-cell" } })}>説明</Table.Header>
                <Table.Header width="150px">操作</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <For each={props.items()}>
                {(item) => (
                  <Table.Row>
                    <Table.Cell>
                      <A href={`/<% feature %>s/${item.id}`} class={css({ textDecoration: "underline", _hover: { color: "fg.muted" } })}>
                        {item.name}
                      </A>
                    </Table.Cell>
                    <Table.Cell class={css({ display: { base: "none", md: "table-cell" } })}>{item.description}</Table.Cell>
                    <Table.Cell>
                      <div class={css({ display: "flex", gap: "1" })}>
                        <IconButton asChild={(btnProps) => <A {...btnProps()} href={`/<% feature %>s/${item.id}`} />} variant="outline" size="sm">
                          <Eye size={14} />
                        </IconButton>
                        <IconButton asChild={(btnProps) => <A {...btnProps()} href={`/<% feature %>s/${item.id}/edit`} />} variant="outline" size="sm">
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
                                  「{item.name}」を削除しますか？
                                </Dialog.Description>
                              </Dialog.Header>
                              <Dialog.Footer>
                                <Dialog.CloseTrigger asChild={(btnProps) => (
                                  <Button {...btnProps()} variant="outline">キャンセル</Button>
                                )} />
                                <form action={delete<% Feature %>} method="post">
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
    </PageContainer>
  );
}
```

# `<% inputs.hasForm ? "" : "!" %>features/<% feature %>/<% Feature %>Form.tsx`

```tsx
import { useSubmission } from "@solidjs/router";
import { Show } from "solid-js";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Card from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { css } from "styled-system/css";
import { PageContainer } from "~/components/ui/container";
import type { <% Feature %> } from "./types";
import type { JSX } from "solid-js";

type <% Feature %>FormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: <% Feature %>;
  submission: ReturnType<typeof useSubmission>;
};

export function <% Feature %>Form(props: <% Feature %>FormProps) {
  return (
    <PageContainer>
      <Card.Root>
        <form action={props.action} method="post" aria-describedby={props.submission.result instanceof Error ? "error-message" : undefined}>
          <Card.Header>
            <Card.Title>
              {props.initial ? "<% entity %>を編集" : "<% entity %>を追加"}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Show when={props.initial}>
              <input type="hidden" name="id" value={props.initial!.id} />
            </Show>
            <div class={css({ display: "flex", flexDirection: "column", gap: "3" })}>
              <Field.Root>
                <Field.Label>名前</Field.Label>
                <Input name="name" placeholder="名前を入力" value={props.initial?.name ?? ""} />
              </Field.Root>
              <Field.Root>
                <Field.Label>説明</Field.Label>
                <Input name="description" placeholder="説明を入力" value={props.initial?.description ?? ""} />
              </Field.Root>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button type="submit">{props.submitLabel}</Button>
            <Show when={props.submission.result instanceof Error}>
              <p style={{ color: "red" }} role="alert" id="error-message">
                {(props.submission.result as Error).message}
              </p>
            </Show>
          </Card.Footer>
        </form>
      </Card.Root>
    </PageContainer>
  );
}
```

# `<% inputs.hasDetail ? "" : "!" %>features/<% feature %>/<% Feature %>Detail.tsx`

```tsx
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";
import { PageContainer } from "~/components/ui/container";
import { Pencil } from "lucide-solid";
import type { <% Feature %> } from "./types";

type <% Feature %>DetailProps = {
  item: () => <% Feature %> | undefined;
};

export function <% Feature %>Detail(props: <% Feature %>DetailProps) {
  return (
    <PageContainer>
      <Show when={props.item()} fallback={<p>読み込み中...</p>}>
        {(item) => (
          <Card.Root>
            <Card.Header>
              <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
                <Card.Title>{item().name}</Card.Title>
                <Button asChild={(btnProps) => <A {...btnProps()} href={`/<% feature %>s/${item().id}/edit`} />} variant="outline" size="sm">
                  <Pencil size={14} /> 編集
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <p class={css({ color: "fg.muted" })}>{item().description}</p>
            </Card.Body>
          </Card.Root>
        )}
      </Show>
    </PageContainer>
  );
}
```
