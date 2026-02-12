"use server";
import { redirect } from "@solidjs/router";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { Items, ItemCategories, ItemCategoryRelations } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getItemCategories(itemId: number) {
  const user = await getUser();
  return db
    .select({
      relationId: ItemCategoryRelations.id,
      categoryId: ItemCategories.id,
      categoryName: ItemCategories.name,
    })
    .from(ItemCategoryRelations)
    .innerJoin(ItemCategories, eq(ItemCategoryRelations.itemCategoryId, ItemCategories.id))
    .innerJoin(Items, eq(ItemCategoryRelations.itemId, Items.id))
    .where(and(eq(ItemCategoryRelations.itemId, itemId), eq(Items.userId, user.id)))
    .all();
}

export async function getCategoryItems(categoryId: number) {
  const user = await getUser();
  return db
    .select({
      relationId: ItemCategoryRelations.id,
      itemId: Items.id,
      itemName: Items.name,
      itemDescription: Items.description,
      itemPrice: Items.price,
      itemQuantity: Items.quantity,
    })
    .from(ItemCategoryRelations)
    .innerJoin(Items, eq(ItemCategoryRelations.itemId, Items.id))
    .innerJoin(ItemCategories, eq(ItemCategoryRelations.itemCategoryId, ItemCategories.id))
    .where(and(eq(ItemCategoryRelations.itemCategoryId, categoryId), eq(ItemCategories.userId, user.id)))
    .all();
}

export async function assignCategory(formData: FormData) {
  const user = await getUser();
  const itemId = Number(formData.get("itemId"));
  const categoryId = Number(formData.get("categoryId"));

  // アイテムの所有権チェック
  const item = db
    .select()
    .from(Items)
    .where(and(eq(Items.id, itemId), eq(Items.userId, user.id)))
    .get();
  if (!item) throw redirect("/items");

  // カテゴリの所有権チェック
  const category = db
    .select()
    .from(ItemCategories)
    .where(and(eq(ItemCategories.id, categoryId), eq(ItemCategories.userId, user.id)))
    .get();
  if (!category) throw redirect("/items");

  const existing = db
    .select()
    .from(ItemCategoryRelations)
    .where(and(eq(ItemCategoryRelations.itemId, itemId), eq(ItemCategoryRelations.itemCategoryId, categoryId)))
    .get();

  if (!existing) {
    db.insert(ItemCategoryRelations)
      .values({ itemId, itemCategoryId: categoryId })
      .run();
  }
  throw redirect(`/items/${itemId}`);
}

export async function removeCategory(formData: FormData) {
  const user = await getUser();
  const relationId = Number(formData.get("relationId"));
  const itemId = Number(formData.get("itemId"));

  // リレーションがユーザー所有のアイテムに関連していることを確認
  const relation = db
    .select()
    .from(ItemCategoryRelations)
    .innerJoin(Items, eq(ItemCategoryRelations.itemId, Items.id))
    .where(and(eq(ItemCategoryRelations.id, relationId), eq(Items.userId, user.id)))
    .get();
  if (!relation) throw redirect(`/items/${itemId}`);

  db.delete(ItemCategoryRelations).where(eq(ItemCategoryRelations.id, relationId)).run();
  throw redirect(`/items/${itemId}`);
}
