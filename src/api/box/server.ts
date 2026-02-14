import { redirect } from "@solidjs/router";
import { storage } from "../../lib/storage";
import { getUser } from "../server";

export async function getBoxes() {
  const user = await getUser();
  return storage.getBoxes().filter((b) => b.userId === user.id);
}

export async function getBoxesByStorage(storageId: number) {
  const user = await getUser();
  return storage.getBoxes().filter((b) => b.storageId === storageId && b.userId === user.id);
}

export async function getBox(id: number) {
  const user = await getUser();
  const box = storage.getBoxes().find((b) => b.id === id && b.userId === user.id);
  return box ?? null;
}

export async function getAllBoxesWithStorage() {
  const user = await getUser();
  const boxes = storage.getBoxes().filter((b) => b.userId === user.id);
  const storages = storage.getStorages();

  return boxes.map((box) => {
    const s = storages.find((st) => st.id === box.storageId);
    return {
      id: box.id,
      name: box.name,
      storageId: box.storageId,
      storageName: s ? s.name : "Unknown",
      isDefault: box.isDefault,
    };
  });
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
  const s = storage.getStorages().find((st) => st.id === storageId && st.userId === user.id);
  if (!s) {
    return new Error("指定された収納場所が見つかりません");
  }

  const newBox = {
    id: storage.generateId(),
    name: name.trim(),
    storageId,
    userId: user.id,
    isDefault: false,
  };

  storage.saveBox(newBox);
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
  const s = storage.getStorages().find((st) => st.id === storageId && st.userId === user.id);
  if (!s) {
    return new Error("指定された収納場所が見つかりません");
  }

  const boxes = storage.getBoxes();
  const existingBoxIndex = boxes.findIndex((b) => b.id === id && b.userId === user.id);

  if (existingBoxIndex === -1) {
    throw new Error("Box not found");
  }
  const existingBox = boxes[existingBoxIndex];

  const updatedBox = {
    ...existingBox,
    name: name.trim(),
    storageId,
  };
  storage.saveBox(updatedBox);
  throw redirect("/boxes");
}

export async function deleteBox(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));

  const box = storage.getBoxes().find((b) => b.id === id && b.userId === user.id);
  if (!box) throw redirect("/boxes");

  if (box.isDefault) {
    return new Error("デフォルトボックスは削除できません");
  }

  // 関連データの削除
  storage.deleteBoxRelationsByBoxId(id);
  storage.deleteBox(id);

  throw redirect("/boxes");
}
