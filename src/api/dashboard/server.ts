"use server";
import { eq, desc, count } from "drizzle-orm";
import { db } from "../db";
import { Items, ItemCategories, Storage, Boxes } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getDashboardStats() {
  const user = await getUser();
  const [{ value: itemCount }] = db.select({ value: count() }).from(Items).where(eq(Items.userId, user.id)).all();
  const [{ value: categoryCount }] = db.select({ value: count() }).from(ItemCategories).where(eq(ItemCategories.userId, user.id)).all();
  const [{ value: storageCount }] = db.select({ value: count() }).from(Storage).where(eq(Storage.userId, user.id)).all();
  const [{ value: boxCount }] = db.select({ value: count() }).from(Boxes).where(eq(Boxes.userId, user.id)).all();
  const recentItems = db
    .select()
    .from(Items)
    .where(eq(Items.userId, user.id))
    .orderBy(desc(Items.id))
    .limit(5)
    .all();

  return {
    itemCount,
    categoryCount,
    storageCount,
    boxCount,
    recentItems,
  };
}
