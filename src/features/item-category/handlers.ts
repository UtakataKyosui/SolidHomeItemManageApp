"use server";
import { redirect } from "@solidjs/router";
import { getUserNotionClient } from "~/lib/notion";
import { getUser } from "~/api/server";
import { getUserConfig } from "~/api/setup/server";

export async function getItemCategories(itemId: string) {
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  try {
    const page: any = await notion.pages.retrieve({ page_id: itemId });
    const pageUserId = page.properties.UserId.rich_text[0]?.plain_text ?? "";
    if (pageUserId !== user.id) {
      return [];
    }

    const categoryIds =
      page.properties.Categories?.relation.map((r: any) => r.id) || [];

    if (categoryIds.length === 0) return [];

    const categories = await Promise.all(
      categoryIds.map(async (catId: string) => {
        const catPage: any = await notion.pages.retrieve({ page_id: catId });
        return {
          relationId: catPage.id,
          categoryId: catPage.id,
          categoryName: catPage.properties.Name.title[0]?.plain_text ?? "",
        };
      }),
    );

    return categories;
  } catch (e) {
    console.error("Error fetching item categories", e);
    return [];
  }
}

export async function getCategoryItems(categoryId: string) {
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
        { property: "Categories", relation: { contains: categoryId } },
      ],
    },
  });

  return response.results.map((page: any) => ({
    relationId: page.id,
    itemId: page.id,
    itemName: page.properties.Name.title[0]?.plain_text ?? "",
    itemDescription:
      page.properties.Description.rich_text[0]?.plain_text ?? "",
    itemPrice: page.properties.Price.number ?? 0,
    itemQuantity: page.properties.Quantity.number ?? 0,
  }));
}

export async function assignCategory(formData: FormData) {
  const itemId = String(formData.get("itemId"));
  const categoryId = String(formData.get("categoryId"));
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const page: any = await notion.pages.retrieve({ page_id: itemId });
  const currentRelations = page.properties.Categories?.relation || [];

  if (currentRelations.some((r: any) => r.id === categoryId)) {
    throw redirect(`/items/${itemId}`);
  }

  await notion.pages.update({
    page_id: itemId,
    properties: {
      Categories: {
        relation: [...currentRelations, { id: categoryId }],
      },
    },
  });

  throw redirect(`/items/${itemId}`);
}

export async function removeCategory(formData: FormData) {
  const relationId = String(formData.get("relationId"));
  const itemId = String(formData.get("itemId"));
  const user = await getUser();
  const notion = await getUserNotionClient(user.id);

  const page: any = await notion.pages.retrieve({ page_id: itemId });
  const currentRelations = page.properties.Categories?.relation || [];

  const newRelations = currentRelations.filter(
    (r: any) => r.id !== relationId,
  );

  await notion.pages.update({
    page_id: itemId,
    properties: {
      Categories: {
        relation: newRelations,
      },
    },
  });

  throw redirect(`/items/${itemId}`);
}
