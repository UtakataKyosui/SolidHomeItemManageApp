"use server";
import { redirect } from "@solidjs/router";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { Boxes, BoxRelations, Storage } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getBoxes() {
  const user = await getUser();
  return db.select().from(Boxes).where(eq(Boxes.userId, user.id)).all();
}

export async function getBoxesByStorage(storageId: number) {
  const user = await getUser();
  return db
    .select()
    .from(Boxes)
    .where(and(eq(Boxes.storageId, storageId), eq(Boxes.userId, user.id)))
    .all();
}

export async function getBox(id: number) {
  const user = await getUser();
  return db
    .select()
    .from(Boxes)
    .where(and(eq(Boxes.id, id), eq(Boxes.userId, user.id)))
    .get() ?? null;
}

export async function getAllBoxesWithStorage() {
  const user = await getUser();
  return db
    .select({
      id: Boxes.id,
      name: Boxes.name,
      storageId: Boxes.storageId,
      storageName: Storage.name,
      isDefault: Boxes.isDefault,
    })
    .from(Boxes)
    .innerJoin(Storage, eq(Boxes.storageId, Storage.id))
    .where(eq(Boxes.userId, user.id))
    .all();
}

export async function createBox(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name"));
  const storageId = Number(formData.get("storageId"));
  if (!name || name.trim() === "") {
    return new Error("ボックス名を入力してください");
  }
  if (!storageId) {
    return new Error("収納場所を選択してください");
  }
  // storageIdがユーザー所有であることを検証
  const storage = db
    .select()
    .from(Storage)
    .where(and(eq(Storage.id, storageId), eq(Storage.userId, user.id)))
    .get();
  if (!storage) {
    return new Error("指定された収納場所が見つかりません");
  }
  db.insert(Boxes)
    .values({ name: name.trim(), storageId, userId: user.id, isDefault: false })
    .run();
  throw redirect("/boxes");
}

export async function updateBox(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name"));
  const storageId = Number(formData.get("storageId"));
  if (!name || name.trim() === "") {
    return new Error("ボックス名を入力してください");
  }
  if (!storageId) {
    return new Error("収納場所を選択してください");
  }
  // storageIdがユーザー所有であることを検証
  const storage = db
    .select()
    .from(Storage)
    .where(and(eq(Storage.id, storageId), eq(Storage.userId, user.id)))
    .get();
  if (!storage) {
    return new Error("指定された収納場所が見つかりません");
  }
  db.update(Boxes)
    .set({ name: name.trim(), storageId })
    .where(and(eq(Boxes.id, id), eq(Boxes.userId, user.id)))
    .run();
  throw redirect("/boxes");
}

export async function deleteBox(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  // デフォルトBoxは削除不可
  const box = db
    .select()
    .from(Boxes)
    .where(and(eq(Boxes.id, id), eq(Boxes.userId, user.id)))
    .get();
  if (!box) throw redirect("/boxes");
  if (box.isDefault) {
    return new Error("デフォルトボックスは削除できません");
  }
  // トランザクションで関連データを一括削除
  db.transaction((tx) => {
    tx.delete(BoxRelations).where(eq(BoxRelations.boxId, id)).run();
    tx.delete(Boxes)
      .where(and(eq(Boxes.id, id), eq(Boxes.userId, user.id)))
      .run();
  });
  throw redirect("/boxes");
}
