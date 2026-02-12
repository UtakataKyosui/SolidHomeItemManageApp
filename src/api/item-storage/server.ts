"use server";
import { redirect } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { Items, Storage, StorageRelations } from "../../../drizzle/schema";
import { getUser } from "../server";

export async function getItemStorages(itemId: number) {
  await getUser();
  return db
    .select({
      relationId: StorageRelations.id,
      storageId: Storage.id,
      storageName: Storage.name,
    })
    .from(StorageRelations)
    .innerJoin(Storage, eq(StorageRelations.storageId, Storage.id))
    .where(eq(StorageRelations.itemId, itemId))
    .all();
}

export async function getStorageItems(storageId: number) {
  await getUser();
  return db
    .select({
      relationId: StorageRelations.id,
      itemId: Items.id,
      itemName: Items.name,
      itemDescription: Items.description,
      itemPrice: Items.price,
      itemQuantity: Items.quantity,
    })
    .from(StorageRelations)
    .innerJoin(Items, eq(StorageRelations.itemId, Items.id))
    .where(eq(StorageRelations.storageId, storageId))
    .all();
}

export async function assignStorage(formData: FormData) {
  await getUser();
  const itemId = Number(formData.get("itemId"));
  const storageId = Number(formData.get("storageId"));

  const existing = db
    .select()
    .from(StorageRelations)
    .where(eq(StorageRelations.itemId, itemId))
    .all()
    .find((r) => r.storageId === storageId);

  if (!existing) {
    db.insert(StorageRelations)
      .values({ itemId, storageId })
      .run();
  }
  throw redirect(`/items/${itemId}`);
}

export async function removeStorage(formData: FormData) {
  await getUser();
  const relationId = Number(formData.get("relationId"));
  const itemId = Number(formData.get("itemId"));
  db.delete(StorageRelations).where(eq(StorageRelations.id, relationId)).run();
  throw redirect(`/items/${itemId}`);
}
