import { redirect } from "@solidjs/router";
import { storage } from "../../lib/storage";
import { getUser } from "../server";

export async function getItemBoxes(itemId: number) {
  const user = await getUser();
  const boxRelations = storage.getBoxRelations();
  const boxes = storage.getBoxes();
  const storages = storage.getStorages();
  const items = storage.getItems();

  const item = items.find((i) => i.id === itemId && i.userId === user.id);
  if (!item) return [];

  const relations = boxRelations.filter((r) => r.itemId === itemId);

  return relations.map((r) => {
    const box = boxes.find((b) => b.id === r.boxId);
    if (!box || box.userId !== user.id) return null;

    const s = storages.find((st) => st.id === box.storageId);

    return {
      relationId: r.id,
      boxId: box.id,
      boxName: box.name,
      storageId: s ? s.id : 0,
      storageName: s ? s.name : "Unknown",
      isDefault: box.isDefault,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function getBoxItems(boxId: number) {
  const user = await getUser();
  const boxRelations = storage.getBoxRelations();
  const items = storage.getItems();
  const boxes = storage.getBoxes();

  const box = boxes.find((b) => b.id === boxId && b.userId === user.id);
  if (!box) return [];

  const relations = boxRelations.filter((r) => r.boxId === boxId);

  return relations.map((r) => {
    const item = items.find((i) => i.id === r.itemId);
    if (!item || item.userId !== user.id) return null;

    return {
      relationId: r.id,
      itemId: item.id,
      itemName: item.name,
      itemDescription: item.description,
      itemPrice: item.price,
      itemQuantity: item.quantity,
      itemImage: item.image,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function getStorageBoxesWithItems(storageId: number) {
  const user = await getUser();
  const boxes = storage.getBoxes().filter((b) => b.storageId === storageId && b.userId === user.id);

  if (boxes.length === 0) return [];

  const boxRelations = storage.getBoxRelations();
  const items = storage.getItems();

  const result = boxes.map((box) => {
    const relations = boxRelations.filter((r) => r.boxId === box.id);
    const boxItems = relations.map((r) => {
      const item = items.find((i) => i.id === r.itemId);
      if (!item || item.userId !== user.id) return null;

      return {
        relationId: r.id,
        boxId: r.boxId,
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        itemPrice: item.price,
        itemQuantity: item.quantity,
        itemImage: item.image,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      ...box,
      items: boxItems,
    };
  });

  return result;
}

export async function assignBox(formData: FormData) {
  const user = await getUser();
  const itemId = Number(formData.get("itemId"));
  const boxId = Number(formData.get("boxId"));

  const items = storage.getItems();
  const boxes = storage.getBoxes();

  const item = items.find((i) => i.id === itemId && i.userId === user.id);
  if (!item) throw redirect("/items");

  const box = boxes.find((b) => b.id === boxId && b.userId === user.id);
  if (!box) throw redirect("/items");

  const relations = storage.getBoxRelations();
  const existing = relations.find((r) => r.itemId === itemId && r.boxId === boxId);

  if (!existing) {
    const newRelation = {
      id: storage.generateId(),
      itemId,
      boxId,
    };
    storage.saveBoxRelation(newRelation);
  }
  throw redirect(`/items/${itemId}`);
}

export async function removeBox(formData: FormData) {
  const user = await getUser();
  const relationId = Number(formData.get("relationId"));
  const itemId = Number(formData.get("itemId"));

  const relations = storage.getBoxRelations();
  const items = storage.getItems();

  const relation = relations.find((r) => r.id === relationId);
  if (!relation) throw redirect(`/items/${itemId}`);

  const item = items.find((i) => i.id === relation.itemId && i.userId === user.id);
  if (!item) throw redirect(`/items/${itemId}`);

  storage.deleteBoxRelation(relationId);
  throw redirect(`/items/${itemId}`);
}
