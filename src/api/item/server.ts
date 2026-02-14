"use server";
import { redirect } from "@solidjs/router";
import { getUserNotionClient } from "~/lib/notion";
import { getUser } from "../server";
import { getUserConfig } from "../setup/server";

export async function getItems(): Promise<any[]> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) return [];

  const response = await notion.databases.query({
    database_id: config.notionDbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: user.id } },
        { property: "Type", select: { equals: "Item" } },
      ],
    },
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: page.properties.Name.title[0]?.plain_text ?? "",
    description: page.properties.Description.rich_text[0]?.plain_text ?? "",
    price: page.properties.Price.number ?? 0,
    quantity: page.properties.Quantity.number ?? 0,
    image: page.properties.Image.url ?? "",
    userId: page.properties.UserId.rich_text[0]?.plain_text ?? "",
  }));
}

export async function getItem(itemId: string): Promise<any> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  try {
    const page: any = await notion.pages.retrieve({ page_id: itemId });
    const pageUserId = page.properties.UserId.rich_text[0]?.plain_text ?? "";
    if (pageUserId !== user.id) {
      throw redirect("/items");
    }

    return {
      id: page.id,
      name: page.properties.Name.title[0]?.plain_text ?? "",
      description: page.properties.Description.rich_text[0]?.plain_text ?? "",
      price: page.properties.Price.number ?? 0,
      quantity: page.properties.Quantity.number ?? 0,
      image: page.properties.Image.url ?? "",
      userId: pageUserId,
    };
  } catch (e) {
    throw redirect("/items");
  }
}

export async function createItem(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) throw redirect("/dashboard");

  const name = String(formData.get("name"));
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") || 0);
  const quantity = Number(formData.get("quantity") || 0);

  if (!name || name.trim() === "") {
    return new Error("アイテム名を入力してください");
  }

  await notion.pages.create({
    parent: { database_id: config.notionDbId },
    properties: {
      Name: { title: [{ text: { content: name.trim() } }] },
      Type: { select: { name: "Item" } },
      Description: { rich_text: [{ text: { content: description.trim() } }] },
      Price: { number: price },
      Quantity: { number: quantity },
      UserId: { rich_text: [{ text: { content: user.id } }] },
    },
  });
  throw redirect("/items");
}

export async function updateItem(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") || 0);
  const quantity = Number(formData.get("quantity") || 0);

  if (!name || name.trim() === "") {
    return new Error("アイテム名を入力してください");
  }

  await notion.pages.update({
    page_id: id,
    properties: {
      Name: { title: [{ text: { content: name.trim() } }] },
      Description: { rich_text: [{ text: { content: description.trim() } }] },
      Price: { number: price },
      Quantity: { number: quantity },
    },
  });
  throw redirect("/items");
}

export async function deleteItem(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const id = String(formData.get("id"));

  await notion.pages.update({
    page_id: id,
    archived: true,
  });
  throw redirect("/items");
}
