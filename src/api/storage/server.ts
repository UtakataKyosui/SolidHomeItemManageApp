import { redirect } from "@solidjs/router";
import { storage } from "../../lib/storage";
import { getUser } from "../server";

export async function getStorages() {
  const user = await getUser();
  return storage.getStorages().filter((s) => s.userId === user.id);
}

export async function getStorage(id: number) {
  const user = await getUser();
  const st = storage.getStorages().find((s) => s.id === id && s.userId === user.id);
  if (!st) throw redirect("/storages");
  return st;
}

export async function createStorage(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name"));

  if (!name || name.trim() === "") {
    return new Error("収納場所名を入力してください");
  }

  const newStorage = {
    id: storage.generateId(),
    name: name.trim(),
    userId: user.id,
  };

  storage.saveStorage(newStorage);

  // デフォルトBoxを自動作成
  // ID生成が早すぎると重複する可能性は低いがあるかもしれないので、少し待つか、storage側で担保するか。
  // generateId()は現在時刻+ランダムなので、連続実行でもおそらく大丈夫。
  const defaultBox = {
    id: storage.generateId() + 1, // 念のためずらす
    name: "デフォルト",
    storageId: newStorage.id,
    userId: user.id,
    isDefault: true,
  };
  storage.saveBox(defaultBox);

  throw redirect("/storages");
}

export async function updateStorage(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name"));

  if (!name || name.trim() === "") {
    return new Error("収納場所名を入力してください");
  }

  const storages = storage.getStorages();
  const existingStorageIndex = storages.findIndex((s) => s.id === id && s.userId === user.id);

  if (existingStorageIndex === -1) {
    throw new Error("Storage not found");
  }
  const existingStorage = storages[existingStorageIndex];

  const updatedStorage = {
    ...existingStorage,
    name: name.trim(),
  };

  storage.saveStorage(updatedStorage);
  throw redirect("/storages");
}

export async function deleteStorage(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));

  const st = storage.getStorages().find((s) => s.id === id && s.userId === user.id);
  if (!st) return;

  // 関連する Box と BoxRelations もカスケード削除
  const boxes = storage.getBoxes().filter((b) => b.storageId === id);
  for (const box of boxes) {
    // deleteBox関数を使えば関連リレーションも消える
    // ただしdeleteBoxはredirectを含んでいるので、ここでは直接storageメソッドを呼ぶか、あるいはロジックを再実装するか。
    // deleteBox関数はredirectするのでループ内で呼べない。ロジックをここに書く。
    storage.deleteBoxRelationsByBoxId(box.id);
    storage.deleteBox(box.id);
  }

  storage.deleteStorage(id);

  throw redirect("/storages");
}
