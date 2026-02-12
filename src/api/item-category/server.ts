"use server";
import { redirect } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { Items, ItemCategories, ItemCategoryRelations } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getItemCategories(itemId: number) {
  await getUser();
  return db
    .select({
      relationId: ItemCategoryRelations.id,
      categoryId: ItemCategories.id,
      categoryName: ItemCategories.name,
    })
    .from(ItemCategoryRelations)
    .innerJoin(ItemCategories, eq(ItemCategoryRelations.itemCategoryId, ItemCategories.id))
    .where(eq(ItemCategoryRelations.itemId, itemId))
    .all();
}

export async function getCategoryItems(categoryId: number) {
  await getUser();
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
    .where(eq(ItemCategoryRelations.itemCategoryId, categoryId))
    .all();
}

export async function assignCategory(formData: FormData) {
  await getUser();
  const itemId = Number(formData.get("itemId"));
  const categoryId = Number(formData.get("categoryId"));

  const existing = db
    .select()
    .from(ItemCategoryRelations)
    .where(eq(ItemCategoryRelations.itemId, itemId))
    .all()
    .find((r) => r.itemCategoryId === categoryId);

  if (!existing) {
    db.insert(ItemCategoryRelations)
      .values({ itemId, itemCategoryId: categoryId })
      .run();
  }
  throw redirect(`/items/${itemId}`);
}

export async function removeCategory(formData: FormData) {
  await getUser();
  const relationId = Number(formData.get("relationId"));
  const itemId = Number(formData.get("itemId"));
  db.delete(ItemCategoryRelations).where(eq(ItemCategoryRelations.id, relationId)).run();
  throw redirect(`/items/${itemId}`);
}
