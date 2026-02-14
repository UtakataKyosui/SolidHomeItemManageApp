"use server";
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

/** ログイン中ユーザーがアクセス権を持つオブジェクト一覧を取得 */
export async function getAccessibleObjects() {
    const sessionUser = await getUser();
    const notion = await getUserNotionClient(sessionUser.id);
    const { findAccessibleObjects } = await import("~/lib/notion-setup");
    return findAccessibleObjects(notion);
}

/** 選択されたオブジェクトを使ってセットアップする */
export async function setupDatabase(formData: FormData) {
    const sessionUser = await getUser();
    const { db } = await import("~/api/db");
    const { user } = await import("../../../drizzle/schema");

    const objectId = String(formData.get("objectId") ?? "").trim();

    if (!objectId) {
        return new Error("オブジェクトを選択してください。");
    }

    const notion = await getUserNotionClient(sessionUser.id);

    try {
        // クライアントの hidden input に頼らず、サーバー側で型を判定
        const { findAccessibleObjects } = await import("~/lib/notion-setup");
        const objects = await findAccessibleObjects(notion);
        const selectedObj = objects.find((o) => o.id === objectId);

        if (!selectedObj) {
            return new Error("選択したオブジェクトが見つかりませんでした。再度ログインしてください。");
        }

        let databaseId: string;

        if (selectedObj.object === "database") {
            // 既存データベースにプロパティを追加
            const { configureExistingDatabase } = await import("~/lib/notion-setup");
            await configureExistingDatabase(notion, objectId);
            databaseId = objectId;
        } else {
            // ページ内に新規データベースを作成
            const { createAppDatabase } = await import("~/lib/notion-setup");
            databaseId = await createAppDatabase(notion, objectId);
        }

        await db
            .update(user)
            .set({ notionDbId: databaseId })
            .where(eq(user.id, sessionUser.id));

        throw redirect("/dashboard");
    } catch (e: any) {
        if (e instanceof Response) throw e;
        console.error("Setup failed:", e);
        return new Error(
            `セットアップに失敗しました: ${e?.message ?? "不明なエラー"}`,
        );
    }
}
