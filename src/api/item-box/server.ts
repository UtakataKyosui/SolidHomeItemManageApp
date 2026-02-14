"use server";
import { redirect } from "@solidjs/router";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "../db";
import { Items, Boxes, BoxRelations, Storage } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getItemBoxes(itemId: number) {
  const user = await getUser();
  return db
    .select({
      relationId: BoxRelations.id,
      boxId: Boxes.id,
      boxName: Boxes.name,
      storageId: Storage.id,
      storageName: Storage.name,
      isDefault: Boxes.isDefault,
    })
    .from(BoxRelations)
    .innerJoin(Boxes, eq(BoxRelations.boxId, Boxes.id))
    .innerJoin(Storage, eq(Boxes.storageId, Storage.id))
    .innerJoin(Items, eq(BoxRelations.itemId, Items.id))
    .where(and(eq(BoxRelations.itemId, itemId), eq(Items.userId, user.id)))
    .all();
}

export async function getBoxItems(boxId: number) {
  const user = await getUser();
  return db
    .select({
      relationId: BoxRelations.id,
      itemId: Items.id,
      itemName: Items.name,
      itemDescription: Items.description,
      itemPrice: Items.price,
      itemQuantity: Items.quantity,
    })
    .from(BoxRelations)
    .innerJoin(Items, eq(BoxRelations.itemId, Items.id))
    .innerJoin(Boxes, eq(BoxRelations.boxId, Boxes.id))
    .where(and(eq(BoxRelations.boxId, boxId), eq(Boxes.userId, user.id)))
    .all();
}

export async function getStorageBoxesWithItems(storageId: number) {
  const user = await getUser();
  const boxes = db
    .select()
    .from(Boxes)
    .where(and(eq(Boxes.storageId, storageId), eq(Boxes.userId, user.id)))
    .all();

  if (boxes.length === 0) {
    return [];
  }

  const boxIds = boxes.map((b) => b.id);

  const items = db
    .select({
      relationId: BoxRelations.id,
      boxId: BoxRelations.boxId,
      itemId: Items.id,
      itemName: Items.name,
      itemDescription: Items.description,
      itemPrice: Items.price,
      itemQuantity: Items.quantity,
    })
    .from(BoxRelations)
    .innerJoin(Items, eq(BoxRelations.itemId, Items.id))
    .where(inArray(BoxRelations.boxId, boxIds))
    .all();

  const itemsByBoxId = new Map<number, typeof items>();
  for (const item of items) {
    if (!itemsByBoxId.has(item.boxId)) {
      itemsByBoxId.set(item.boxId, []);
    }
    itemsByBoxId.get(item.boxId)!.push(item);
  }

  return boxes.map((box) => ({
    ...box,
    items: itemsByBoxId.get(box.id) || [],
  }));
}

export async function assignBox(formData: FormData) {
  const user = await getUser();
  const itemId = Number(formData.get("itemId"));
  const boxId = Number(formData.get("boxId"));

  // アイテムの所有権チェック
  const item = db
    .select()
    .from(Items)
    .where(and(eq(Items.id, itemId), eq(Items.userId, user.id)))
    .get();
  if (!item) throw redirect("/items");

  // ボックスの所有権チェック
  const box = db
    .select()
    .from(Boxes)
    .where(and(eq(Boxes.id, boxId), eq(Boxes.userId, user.id)))
    .get();
  if (!box) throw redirect("/items");

  const existing = db
    .select()
    .from(BoxRelations)
    .where(and(eq(BoxRelations.itemId, itemId), eq(BoxRelations.boxId, boxId)))
    .get();

  if (!existing) {
    db.insert(BoxRelations).values({ itemId, boxId }).run();
  }
  throw redirect(`/items/${itemId}`);
}

export async function removeBox(formData: FormData) {
  const user = await getUser();
  const relationId = Number(formData.get("relationId"));
  const itemId = Number(formData.get("itemId"));

  // リレーションがユーザー所有のアイテムに関連していることを確認
  const relation = db
    .select()
    .from(BoxRelations)
    .innerJoin(Items, eq(BoxRelations.itemId, Items.id))
    .where(and(eq(BoxRelations.id, relationId), eq(Items.userId, user.id)))
    .get();
  if (!relation) throw redirect(`/items/${itemId}`);

  db.delete(BoxRelations).where(eq(BoxRelations.id, relationId)).run();
  throw redirect(`/items/${itemId}`);
}
