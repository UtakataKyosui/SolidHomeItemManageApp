import { redirect } from "@solidjs/router";
import { storage } from "../../lib/storage";
import { getUser } from "../server";

export async function getCategories() {
  const user = await getUser();
  return storage.getItemCategories().filter((c) => c.userId === user.id);
}

export async function getCategory(id: number) {
  const user = await getUser();
  const category = storage.getItemCategories().find((c) => c.id === id && c.userId === user.id);
  if (!category) throw redirect("/categories");
  return category;
}

export async function createCategory(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name"));

  if (!name || name.trim() === "") {
    return new Error("カテゴリ名を入力してください");
  }

  const newCategory = {
    id: storage.generateId(),
    name: name.trim(),
    userId: user.id,
  };

  storage.saveItemCategory(newCategory);
  throw redirect("/categories");
}

export async function updateCategory(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name"));

  if (!name || name.trim() === "") {
    return new Error("カテゴリ名を入力してください");
  }

  const categories = storage.getItemCategories();
  const existingCategoryIndex = categories.findIndex((c) => c.id === id && c.userId === user.id);

  if (existingCategoryIndex === -1) {
    throw new Error("Category not found");
  }
  const existingCategory = categories[existingCategoryIndex];

  const updatedCategory = {
    ...existingCategory,
    name: name.trim(),
  };

  storage.saveItemCategory(updatedCategory);
  throw redirect("/categories");
}

export async function deleteCategory(formData: FormData) {
  const user = await getUser();
  const id = Number(formData.get("id"));

  const category = storage.getItemCategories().find((c) => c.id === id && c.userId === user.id);
  if (!category) return;

  // 関連データの削除
  storage.deleteItemCategoryRelationsByCategoryId(id);
  storage.deleteItemCategory(id);

  throw redirect("/categories");
}
