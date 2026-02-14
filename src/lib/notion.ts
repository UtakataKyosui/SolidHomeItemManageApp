import { Client } from "@notionhq/client";
import { eq, and } from "drizzle-orm";

export const createNotionClient = (accessToken: string) => {
    return new Client({
        auth: accessToken,
    });
};

export const getUserNotionClient = async (userId: string) => {
    const { db } = await import("~/api/db");
    const { account } = await import("../../drizzle/schema");

    const accountData = await db.query.account.findFirst({
        where: and(
            eq(account.userId, userId),
            eq(account.providerId, "notion")
        ),
    });

    if (!accountData || !accountData.accessToken) {
        throw new Error("No Notion account connected or missing access token.");
    }

    return createNotionClient(accountData.accessToken);
};

export type PageId = string;
