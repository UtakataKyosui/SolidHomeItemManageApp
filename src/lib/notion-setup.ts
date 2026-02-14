import type { Client } from "@notionhq/client";
import { createNotionClient } from "./notion";

// Helper to find a parent page to create databases in
export async function findParentPage(notion: Client): Promise<string | null> {
    const response = await notion.search({
        filter: {
            value: "page",
            property: "object",
        },
        sort: {
            direction: "descending",
            timestamp: "last_edited_time",
        },
        page_size: 1,
    });

    if (response.results.length > 0) {
        return response.results[0].id;
    }
    return null;
}

export async function setupUserDatabase(userId: string, accessToken: string) {
    const notion = createNotionClient(accessToken);
    const parentPageId = await findParentPage(notion);

    if (!parentPageId) {
        throw new Error(
            "No accessible parent page found in your Notion workspace. Please make sure to grant access to at least one page during login.",
        );
    }

    // Create a single unified database
    const db = await notion.databases.create({
        parent: { type: "page_id", page_id: parentPageId },
        title: [{ type: "text", text: { content: "Home Clean Manage" } }],
        properties: {
            Name: { title: {} },
            Type: {
                select: {
                    options: [
                        { name: "Item", color: "blue" },
                        { name: "Category", color: "green" },
                        { name: "Storage", color: "orange" },
                        { name: "Box", color: "purple" },
                    ],
                },
            },
            Description: { rich_text: {} },
            Price: { number: { format: "yen" } },
            Quantity: { number: { format: "number" } },
            Image: { url: {} },
            UserId: { rich_text: {} },
            // Self-relations
            Categories: { relation: { database_id: "self", type: "single_property" } },
            Boxes: { relation: { database_id: "self", type: "single_property" } },
            Storage: { relation: { database_id: "self", type: "single_property" } },
        },
    } as any);

    return { notionDbId: db.id };
}
