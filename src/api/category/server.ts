"use server";
import { redirect } from "@solidjs/router";
import { getUserNotionClient } from "~/lib/notion";
import { getUser } from "../server";
import { getUserConfig } from "../setup/server";

export async function getCategories(): Promise<any[]> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) return [];

  const response = await notion.databases.query({
    database_id: config.notionDbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: user.id } },
        { property: "Type", select: { equals: "Category" } },
      ],
    },
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: page.properties.Name.title[0]?.plain_text ?? "",
    userId: page.properties.UserId.rich_text[0]?.plain_text ?? "",
  }));
}

export async function createCategory(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) throw redirect("/dashboard");

  const name = String(formData.get("name"));

  if (!name || name.trim() === "") {
    return new Error("カテゴリー名を入力してください");
  }

  await notion.pages.create({
    parent: { database_id: config.notionDbId },
    properties: {
      Name: { title: [{ text: { content: name.trim() } }] },
      Type: { select: { name: "Category" } },
      UserId: { rich_text: [{ text: { content: user.id } }] },
    },
  });
  throw redirect("/categories");
}

export async function deleteCategory(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const id = String(formData.get("id"));

  await notion.pages.update({
    page_id: id,
    archived: true,
  });
  throw redirect("/categories");
}

export async function updateCategory(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const id = String(formData.get("id"));
  const name = String(formData.get("name"));

  if (!id) throw new Error("ID required");

  const properties: any = {};
  if (name) properties.Name = { title: [{ text: { content: name.trim() } }] };

  await notion.pages.update({
    page_id: id,
    properties,
  });
  throw redirect(`/categories`);
}

export async function getCategory(categoryId: string): Promise<any> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const response = await notion.pages.retrieve({ page_id: categoryId });

  if (
    (response as any).properties.UserId.rich_text[0]?.plain_text !== user.id
  ) {
    throw new Error("Unauthorized access to category.");
  }

  return {
    id: (response as any).id,
    name: (response as any).properties.Name.title[0]?.plain_text ?? "",
    userId: (response as any).properties.UserId.rich_text[0]?.plain_text ?? "",
  };
}
