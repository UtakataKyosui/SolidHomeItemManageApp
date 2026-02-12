"use server";
import { redirect } from "@solidjs/router";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { Items, ItemCategoryRelations, BoxRelations } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getItems() {
  const user = await getUser();
  return db.select().from(Items).where(eq(Items.userId, user.id)).all();
}

export async function getItem(id: number) {
  const user = await getUser();
  const item = db
    .select()
    .from(Items)
    .where(and(eq(Items.id, id), eq(Items.userId, user.id)))
    .get();
  if (!item) throw redirect("/items");
  return item;
}

export async function createItem(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name"));
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") || 0);
  const quantity = Number(formData.get("quantity") || 0);

  if (!name || name.trim() === "") {
    return new Error("アイテム名を入力してください");
  }

  db.insert(Items)
    .values({
      name: name.trim(),
      description: description.trim(),
      price,
      quantity,
      userId: user.id,
    })
    .run();
  throw redirect("/items");
}

export async function updateItem(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name"));
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") || 0);
  const quantity = Number(formData.get("quantity") || 0);

  if (!name || name.trim() === "") {
    return new Error("アイテム名を入力してください");
  }

  db.update(Items)
    .set({
      name: name.trim(),
      description: description.trim(),
      price,
      quantity,
    })
    .where(and(eq(Items.id, id), eq(Items.userId, user.id)))
    .run();
  throw redirect("/items");
}

export async function deleteItem(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  db.transaction((tx) => {
    // 所有権を先に検証
    const item = tx.select().from(Items).where(and(eq(Items.id, id), eq(Items.userId, user.id))).get();
    if (!item) return;

    // カスケード削除（トランザクションで原子性を保証）
    tx.delete(ItemCategoryRelations).where(eq(ItemCategoryRelations.itemId, id)).run();
    tx.delete(BoxRelations).where(eq(BoxRelations.itemId, id)).run();
    tx.delete(Items)
      .where(and(eq(Items.id, id), eq(Items.userId, user.id)))
      .run();
  });
  throw redirect("/items");
}
