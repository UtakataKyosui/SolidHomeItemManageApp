"use server";
import { redirect } from "@solidjs/router";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { ItemCategories, ItemCategoryRelations } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getCategories() {
  const user = await getUser();
  return db.select().from(ItemCategories).where(eq(ItemCategories.userId, user.id)).all();
}

export async function getCategory(id: number) {
  const user = await getUser();
  const category = db
    .select()
    .from(ItemCategories)
    .where(and(eq(ItemCategories.id, id), eq(ItemCategories.userId, user.id)))
    .get();
  if (!category) throw redirect("/categories");
  return category;
}

export async function createCategory(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name"));
  if (!name || name.trim() === "") {
    return new Error("カテゴリ名を入力してください");
  }
  db.insert(ItemCategories).values({ name: name.trim(), userId: user.id }).run();
  throw redirect("/categories");
}

export async function updateCategory(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name"));
  if (!name || name.trim() === "") {
    return new Error("カテゴリ名を入力してください");
  }
  db.update(ItemCategories)
    .set({ name: name.trim() })
    .where(and(eq(ItemCategories.id, id), eq(ItemCategories.userId, user.id)))
    .run();
  throw redirect("/categories");
}

export async function deleteCategory(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  db.delete(ItemCategoryRelations).where(eq(ItemCategoryRelations.itemCategoryId, id)).run();
  db.delete(ItemCategories)
    .where(and(eq(ItemCategories.id, id), eq(ItemCategories.userId, user.id)))
    .run();
  throw redirect("/categories");
}
