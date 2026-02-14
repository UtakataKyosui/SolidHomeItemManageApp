import type { Client } from "@notionhq/client";

export type AccessibleObject = { id: string; title: string; object: string };

/** 必要なプロパティ定義（リレーション以外） */
const REQUIRED_PROPERTIES: Record<string, { type: string; config: any }> = {
    Type: {
        type: "select",
        config: {
            select: {
                options: [
                    { name: "Item", color: "blue" },
                    { name: "Category", color: "green" },
                    { name: "Storage", color: "orange" },
                    { name: "Box", color: "purple" },
                ],
            },
        },
    },
    Description: { type: "rich_text", config: { rich_text: {} } },
    Price: { type: "number", config: { number: { format: "yen" } } },
    Quantity: { type: "number", config: { number: { format: "number" } } },
    Image: { type: "url", config: { url: {} } },
    UserId: { type: "rich_text", config: { rich_text: {} } },
};

/** リレーションプロパティ名 */
const RELATION_PROPERTIES = ["Categories", "Boxes", "Storage"];

/** ユーザーがアクセス権を付与したオブジェクトを検索する */
export async function findAccessibleObjects(
    notion: Client,
): Promise<AccessibleObject[]> {
    const response = await notion.search({
        sort: {
            direction: "descending",
            timestamp: "last_edited_time",
        },
        page_size: 50,
    });

    return response.results.map((result: any) => {
        let title = "(無題)";
        if (result.object === "page") {
            const titleProp = Object.values(result.properties ?? {}).find(
                (p: any) => p.type === "title",
            ) as any;
            title = titleProp?.title?.[0]?.plain_text ?? "(無題のページ)";
        } else if (result.object === "database") {
            title = result.title?.[0]?.plain_text ?? "(無題のデータベース)";
        }
        return { id: result.id, title, object: result.object };
    });
}

/** ページ内にアプリ用データベースを新規作成する */
export async function createAppDatabase(
    notion: Client,
    parentPageId: string,
): Promise<string> {
    const db = await notion.databases.create({
        parent: { type: "page_id", page_id: parentPageId },
        title: [{ type: "text", text: { content: "Home Clean Manage" } }],
        properties: {
            Name: { title: {} },
            ...Object.fromEntries(
                Object.entries(REQUIRED_PROPERTIES).map(([k, v]) => [k, v.config]),
            ),
        },
    } as any);

    await addSelfRelations(notion, db.id, {});
    return db.id;
}

/** 既存データベースに不足しているプロパティだけを追加する */
export async function configureExistingDatabase(
    notion: Client,
    databaseId: string,
): Promise<void> {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const existing = (db as any).properties as Record<string, { type: string }>;

    // 不足している基本プロパティを収集
    const missingProps: Record<string, any> = {};
    for (const [name, def] of Object.entries(REQUIRED_PROPERTIES)) {
        if (!existing[name] || existing[name].type !== def.type) {
            missingProps[name] = def.config;
        }
    }

    if (Object.keys(missingProps).length > 0) {
        await notion.databases.update({
            database_id: databaseId,
            properties: missingProps,
        } as any);
    }

    await addSelfRelations(notion, databaseId, existing);
}

/** 不足しているリレーションプロパティだけを追加する */
async function addSelfRelations(
    notion: Client,
    databaseId: string,
    existing: Record<string, { type: string }>,
): Promise<void> {
    const missingRelations: Record<string, any> = {};
    for (const name of RELATION_PROPERTIES) {
        if (!existing[name] || existing[name].type !== "relation") {
            missingRelations[name] = {
                relation: { database_id: databaseId, single_property: {} },
            };
        }
    }

    if (Object.keys(missingRelations).length > 0) {
        await notion.databases.update({
            database_id: databaseId,
            properties: missingRelations,
        } as any);
    }
}
