"use server";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { Items, ItemCategories, Storage } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getDashboardStats() {
  const user = await getUser();
  const items = db.select().from(Items).where(eq(Items.userId, user.id)).all();
  const categories = db.select().from(ItemCategories).where(eq(ItemCategories.userId, user.id)).all();
  const storages = db.select().from(Storage).where(eq(Storage.userId, user.id)).all();
  const recentItems = db
    .select()
    .from(Items)
    .where(eq(Items.userId, user.id))
    .orderBy(desc(Items.id))
    .limit(5)
    .all();

  return {
    itemCount: items.length,
    categoryCount: categories.length,
    storageCount: storages.length,
    recentItems,
  };
}
