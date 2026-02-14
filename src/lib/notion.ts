import { Client } from "@notionhq/client";

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

export const DATABASE_IDS = {
    ITEMS: process.env.NOTION_ITEM_DATABASE_ID!,
    CATEGORIES: process.env.NOTION_CATEGORY_DATABASE_ID!,
    STORAGES: process.env.NOTION_STORAGE_DATABASE_ID!,
    BOXES: process.env.NOTION_BOX_DATABASE_ID!,
};

// Helper types for Notion responses might go here or in a separate types file
export type PageId = string;
