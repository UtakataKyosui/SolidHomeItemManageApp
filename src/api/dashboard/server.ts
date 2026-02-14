"use server";
import { getUser } from "../server";
import { getUserNotionClient } from "~/lib/notion";
import { getUserConfig } from "../setup/server";

export async function getDashboardStats() {
  const user = await getUser();
  const config = await getUserConfig();

  if (!config?.notionDbId) {
    return { needsSetup: true as const };
  }

  const notion = await getUserNotionClient(user.id);

  const dbId = config.notionDbId;

  // Count by Type
  const getCount = async (type: string) => {
    try {
      const response = await notion.databases.query({
        database_id: dbId,
        page_size: 100,
        filter: {
          and: [
            { property: "UserId", rich_text: { equals: user.id } },
            { property: "Type", select: { equals: type } },
          ],
        },
      });
      return response.results.length + (response.has_more ? "+" : "");
    } catch (e) {
      return 0;
    }
  };

  const itemCount = await getCount("Item");
  const categoryCount = await getCount("Category");
  const storageCount = await getCount("Storage");
  const boxCount = await getCount("Box");

  let recentItems: any[] = [];
  try {
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 5,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      filter: {
        and: [
          { property: "UserId", rich_text: { equals: user.id } },
          { property: "Type", select: { equals: "Item" } },
        ],
      },
    });
    recentItems = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name.title[0]?.plain_text ?? "",
      price: page.properties.Price?.number ?? 0,
      quantity: page.properties.Quantity?.number ?? 0,
    }));
  } catch (e) {
    console.error("Failed to fetch recent items", e);
  }

  return {
    itemCount,
    categoryCount,
    storageCount,
    boxCount,
    recentItems,
  };
}
