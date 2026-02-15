"use server";
import { redirect } from "@solidjs/router";
import { getUserNotionClient } from "~/lib/notion";
import { getUser } from "~/api/server";
import { getUserConfig } from "~/api/setup/server";
import type { Box, BoxWithStorage } from "./types";

export async function getBoxes(): Promise<Box[]> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) return [];

  const response = await notion.databases.query({
    database_id: config.notionDbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: user.id } },
        { property: "Type", select: { equals: "Box" } },
      ],
    },
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: page.properties.Name.title[0]?.plain_text ?? "",
    userId: page.properties.UserId.rich_text[0]?.plain_text ?? "",
    storageId: page.properties.Storage?.relation[0]?.id ?? null,
  }));
}

export async function createBox(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) throw redirect("/dashboard");

  const name = String(formData.get("name"));
  const storageId = String(formData.get("storageId"));

  if (!name || name.trim() === "") {
    return new Error("箱名を入力してください");
  }

  const properties: any = {
    Name: { title: [{ text: { content: name.trim() } }] },
    Type: { select: { name: "Box" } },
    UserId: { rich_text: [{ text: { content: user.id } }] },
  };

  if (storageId && storageId !== "undefined" && storageId !== "") {
    properties.Storage = { relation: [{ id: storageId }] };
  }

  await notion.pages.create({
    parent: { database_id: config.notionDbId },
    properties,
  });
  throw redirect("/boxes");
}

export async function deleteBox(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const id = String(formData.get("id"));

  await notion.pages.update({
    page_id: id,
    archived: true,
  });
  throw redirect("/boxes");
}

export async function updateBox(formData: FormData) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  const storageId = String(formData.get("storageId"));

  if (!id) throw new Error("ID required");

  const properties: any = {};
  if (name) properties.Name = { title: [{ text: { content: name.trim() } }] };

  if (storageId && storageId !== "undefined") {
    properties.Storage = { relation: [{ id: storageId }] };
  } else if (storageId === "") {
    properties.Storage = { relation: [] };
  }

  await notion.pages.update({
    page_id: id,
    properties,
  });
  throw redirect(`/boxes/${id}`);
}

export async function getBox(boxId: string): Promise<Box> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const response = await notion.pages.retrieve({ page_id: boxId });

  if (
    (response as any).properties.UserId.rich_text[0]?.plain_text !== user.id
  ) {
    throw new Error("Unauthorized access to box.");
  }

  return {
    id: (response as any).id,
    name: (response as any).properties.Name.title[0]?.plain_text ?? "",
    userId: (response as any).properties.UserId.rich_text[0]?.plain_text ?? "",
    storageId: (response as any).properties.Storage?.relation[0]?.id ?? null,
  };
}

export async function getAllBoxesWithStorage(): Promise<BoxWithStorage[]> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) return [];

  const boxesResponse = await notion.databases.query({
    database_id: config.notionDbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: user.id } },
        { property: "Type", select: { equals: "Box" } },
      ],
    },
  });

  const boxes = await Promise.all(
    boxesResponse.results.map(async (page: any) => {
      const storageRel = page.properties.Storage?.relation[0];
      let storageId = null;
      let storageName = "";

      if (storageRel) {
        storageId = storageRel.id;
        try {
          const storagePage: any = await notion.pages.retrieve({
            page_id: storageId,
          });
          storageName =
            storagePage.properties.Name.title[0]?.plain_text ?? "";
        } catch (e) {
          /* ignore */
        }
      }

      return {
        id: page.id,
        name: page.properties.Name.title[0]?.plain_text ?? "",
        userId: page.properties.UserId.rich_text[0]?.plain_text ?? "",
        storageId: storageId,
        storageName: storageName,
      };
    }),
  );

  return boxes;
}

export async function getBoxesByStorage(storageId: string): Promise<Box[]> {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) return [];

  const response = await notion.databases.query({
    database_id: config.notionDbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: user.id } },
        { property: "Type", select: { equals: "Box" } },
        { property: "Storage", relation: { contains: storageId } },
      ],
    },
  });

  return response.results.map((page: any) => ({
    id: page.id,
    name: page.properties.Name.title[0]?.plain_text ?? "",
    userId: page.properties.UserId.rich_text[0]?.plain_text ?? "",
    storageId: storageId,
  }));
}
