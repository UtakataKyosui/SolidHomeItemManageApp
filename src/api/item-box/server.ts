"use server";
import { redirect } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { Items, Boxes, BoxRelations, Storage } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getItemBoxes(itemId: number) {
  await getUser();
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
    .where(eq(BoxRelations.itemId, itemId))
    .all();
}

export async function getBoxItems(boxId: number) {
  await getUser();
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
    .where(eq(BoxRelations.boxId, boxId))
    .all();
}

export async function getStorageBoxesWithItems(storageId: number) {
  await getUser();
  const boxes = db
    .select()
    .from(Boxes)
    .where(eq(Boxes.storageId, storageId))
    .all();

  const result = [];
  for (const box of boxes) {
    const items = db
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
      .where(eq(BoxRelations.boxId, box.id))
      .all();
    result.push({ ...box, items });
  }
  return result;
}

export async function assignBox(formData: FormData) {
  await getUser();
  const itemId = Number(formData.get("itemId"));
  const boxId = Number(formData.get("boxId"));

  const existing = db
    .select()
    .from(BoxRelations)
    .where(eq(BoxRelations.itemId, itemId))
    .all()
    .find((r) => r.boxId === boxId);

  if (!existing) {
    db.insert(BoxRelations).values({ itemId, boxId }).run();
  }
  throw redirect(`/items/${itemId}`);
}

export async function removeBox(formData: FormData) {
  await getUser();
  const relationId = Number(formData.get("relationId"));
  const itemId = Number(formData.get("itemId"));
  db.delete(BoxRelations).where(eq(BoxRelations.id, relationId)).run();
  throw redirect(`/items/${itemId}`);
}
