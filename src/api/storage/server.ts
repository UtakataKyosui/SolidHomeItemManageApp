"use server";
import { redirect } from "@solidjs/router";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { Storage, Boxes, BoxRelations } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getStorages() {
  const user = await getUser();
  return db.select().from(Storage).where(eq(Storage.userId, user.id)).all();
}

export async function getStorage(id: number) {
  const user = await getUser();
  const storage = db
    .select()
    .from(Storage)
    .where(and(eq(Storage.id, id), eq(Storage.userId, user.id)))
    .get();
  if (!storage) throw redirect("/storages");
  return storage;
}

export async function createStorage(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name"));
  if (!name || name.trim() === "") {
    return new Error("収納場所名を入力してください");
  }
  const result = db.insert(Storage).values({ name: name.trim(), userId: user.id }).run();
  const storageId = Number(result.lastInsertRowid);
  // デフォルトBoxを自動作成
  db.insert(Boxes)
    .values({ name: "デフォルト", storageId, userId: user.id, isDefault: 1 })
    .run();
  throw redirect("/storages");
}

export async function updateStorage(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name"));
  if (!name || name.trim() === "") {
    return new Error("収納場所名を入力してください");
  }
  db.update(Storage)
    .set({ name: name.trim() })
    .where(and(eq(Storage.id, id), eq(Storage.userId, user.id)))
    .run();
  throw redirect("/storages");
}

export async function deleteStorage(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  // 関連する Box と BoxRelations もカスケード削除
  const boxes = db.select().from(Boxes).where(eq(Boxes.storageId, id)).all();
  for (const box of boxes) {
    db.delete(BoxRelations).where(eq(BoxRelations.boxId, box.id)).run();
  }
  db.delete(Boxes).where(eq(Boxes.storageId, id)).run();
  db.delete(Storage)
    .where(and(eq(Storage.id, id), eq(Storage.userId, user.id)))
    .run();
  throw redirect("/storages");
}
