import { redirect } from "@solidjs/router";
import { storage } from "../../lib/storage";
import { getUser } from "../server";

export async function getItems() {
  const user = await getUser();
  return storage.getItems().filter((item) => item.userId === user.id);
}

export async function getItem(id: number) {
  const user = await getUser();
  const items = storage.getItems();
  const item = items.find((i) => i.id === id && i.userId === user.id);
  if (!item) throw redirect("/items");
  return item;
}

export async function createItem(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name"));
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") || 0);
  const quantity = Number(formData.get("quantity") || 0);
  const image = String(formData.get("image") ?? "");

  if (!name || name.trim() === "") {
    return new Error("アイテム名を入力してください");
  }

  const newItem = {
    id: storage.generateId(),
    name: name.trim(),
    description: description.trim(),
    price,
    quantity,
    image: image.startsWith("data:image/") ? image : "",
    userId: user.id,
  };

  storage.saveItem(newItem);
  throw redirect("/items");
}

export async function updateItem(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name"));
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") || 0);
  const quantity = Number(formData.get("quantity") || 0);
  const image = String(formData.get("image") ?? "");

  if (!name || name.trim() === "") {
    return new Error("アイテム名を入力してください");
  }

  const items = storage.getItems();
  const existingItemIndex = items.findIndex((i) => i.id === id && i.userId === user.id);

  if (existingItemIndex === -1) {
    throw new Error("Item not found");
  }
  const existingItem = items[existingItemIndex];

  const updatedItem = {
    ...existingItem,
    name: name.trim(),
    description: description.trim(),
    price,
    quantity,
    image: existingItem.image,
  };

  if (image.startsWith("data:image/")) {
    updatedItem.image = image;
  } else if (image) {
    // Empty valid image data is treated as request to remove image
    updatedItem.image = "";
  }

  storage.saveItem(updatedItem);
  throw redirect("/items");
}

export async function deleteItem(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));

  const items = storage.getItems();
  const item = items.find((i) => i.id === id && i.userId === user.id);

  if (!item) return; // 何もしない、あるいはエラー

  // 関連データの削除
  storage.deleteItemCategoryRelationsByItemId(id);
  storage.deleteBoxRelationsByItemId(id);

  storage.deleteItem(id);

  throw redirect("/items");
}
