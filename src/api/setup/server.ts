import { getUserNotionClient } from "~/lib/notion";
import { getUser } from "~/api/server";
import { eq } from "drizzle-orm";
import { redirect } from "@solidjs/router";

export async function getUserConfig() {
    const sessionUser = await getUser();
    const { db } = await import("~/api/db");
    const { user } = await import("../../../drizzle/schema");
    const userData = await db.query.user.findFirst({
        where: eq(user.id, sessionUser.id),
        columns: {
            notionDbId: true,
        },
    });
    return userData;
}

export async function performAutoSetup() {
    const sessionUser = await getUser();
    const { db } = await import("~/api/db");
    const { user, account } = await import("../../../drizzle/schema");
    const { setupUserDatabase } = await import("~/lib/notion-setup");

    // Get access token
    const accountData = await db.query.account.findFirst({
        where: eq(account.userId, sessionUser.id),
    });

    if (!accountData || !accountData.accessToken) {
        throw new Error("Notion account not connected.");
    }

    const newConfig = await setupUserDatabase(
        sessionUser.id,
        accountData.accessToken,
    );

    await db
        .update(user)
        .set(newConfig)
        .where(eq(user.id, sessionUser.id));

    return { success: true };
}
