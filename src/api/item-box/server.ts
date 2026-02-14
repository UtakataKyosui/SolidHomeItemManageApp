"use server";
import { redirect } from "@solidjs/router";
import { getUserNotionClient } from "~/lib/notion";
import { getUser } from "../server";
import { getUserConfig } from "../setup/server";

// Helper to fetch items for a box (uses single DB with Type filter)
async function getItemsForBox(
  boxId: string,
  userId: string,
  dbId: string,
): Promise<any[]> {
  const notion = await getUserNotionClient(userId);
  const response = await (notion.databases as any).query({
    database_id: dbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: userId } },
        { property: "Type", select: { equals: "Item" } },
        { property: "Boxes", relation: { contains: boxId } },
      ],
    },
  });
  return response.results.map((page: any) => ({
    relationId: page.id,
    boxId: boxId,
    itemId: page.id,
    itemName: page.properties.Name.title[0]?.plain_text ?? "",
    itemDescription:
      page.properties.Description.rich_text[0]?.plain_text ?? "",
    itemPrice: page.properties.Price.number ?? 0,
    itemQuantity: page.properties.Quantity.number ?? 0,
  }));
}

export async function getItemBoxes(itemId: string) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  try {
    const page: any = await notion.pages.retrieve({ page_id: itemId });
    const pageUserId = page.properties.UserId.rich_text[0]?.plain_text ?? "";
    if (pageUserId !== user.id) {
      return [];
    }

    const boxIds =
      page.properties.Boxes?.relation.map((r: any) => r.id) || [];
    if (boxIds.length === 0) return [];

    const boxes = await Promise.all(
      boxIds.map(async (boxId: string) => {
        const boxPage: any = await notion.pages.retrieve({ page_id: boxId });

        let storageId = null;
        let storageName = "";

        const storageRel = boxPage.properties.Storage?.relation[0];
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
          relationId: boxPage.id,
          boxId: boxPage.id,
          boxName: boxPage.properties.Name.title[0]?.plain_text ?? "",
          storageId: storageId,
          storageName: storageName,
          isDefault: false,
        };
      }),
    );

    return boxes;
  } catch (e) {
    console.error("Error fetching item boxes", e);
    return [];
  }
}

export async function getBoxItems(boxId: string) {
  const user = await getUser();
  const config = await getUserConfig();
  if (!config?.notionDbId) return [];
  return getItemsForBox(boxId, user.id, config.notionDbId);
}

export async function getStorageBoxesWithItems(storageId: string) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);
  const config = await getUserConfig();

  if (!config?.notionDbId) return [];

  // 1. Get all boxes in this storage
  const boxesResponse = await (notion.databases as any).query({
    database_id: config.notionDbId,
    filter: {
      and: [
        { property: "UserId", rich_text: { equals: user.id } },
        { property: "Type", select: { equals: "Box" } },
        { property: "Storage", relation: { contains: storageId } },
      ],
    },
  });

  const boxes = boxesResponse.results.map((page: any) => ({
    id: page.id,
    name: page.properties.Name.title[0]?.plain_text ?? "",
    userId: page.properties.UserId.rich_text[0]?.plain_text ?? "",
    storageId: page.properties.Storage?.relation[0]?.id ?? null,
  }));

  if (boxes.length === 0) return [];

  // 2. Fetch items for each box
  const boxesWithItems = await Promise.all(
    boxes.map(async (box: any) => {
      const items = await getItemsForBox(box.id, user.id, config.notionDbId!);
      return { ...box, items: items };
    }),
  );

  return boxesWithItems;
}

export async function assignBox(formData: FormData) {
  const itemId = String(formData.get("itemId"));
  const boxId = String(formData.get("boxId"));
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const page: any = await notion.pages.retrieve({ page_id: itemId });
  const currentRelations = page.properties.Boxes?.relation || [];

  if (currentRelations.some((r: any) => r.id === boxId)) {
    throw redirect(`/items/${itemId}`);
  }

  await notion.pages.update({
    page_id: itemId,
    properties: {
      Boxes: {
        relation: [...currentRelations, { id: boxId }],
      },
    },
  });

  throw redirect(`/items/${itemId}`);
}

export async function removeBox(formData: FormData) {
  const relationId = String(formData.get("relationId"));
  const itemId = String(formData.get("itemId"));
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const page: any = await notion.pages.retrieve({ page_id: itemId });
  const currentRelations = page.properties.Boxes?.relation || [];

  const newRelations = currentRelations.filter(
    (r: any) => r.id !== relationId,
  );

  await notion.pages.update({
    page_id: itemId,
    properties: {
      Boxes: {
        relation: newRelations,
      },
    },
  });

  throw redirect(`/items/${itemId}`);
}
