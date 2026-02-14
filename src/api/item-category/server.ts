import { redirect } from "@solidjs/router";
import { storage } from "../../lib/storage";
import { getUser } from "../server";

export async function getItemCategories(itemId: number) {
  const user = await getUser();
  const relations = storage.getItemCategoryRelations();
  const categories = storage.getItemCategories();
  const items = storage.getItems();

  const item = items.find((i) => i.id === itemId && i.userId === user.id);
  if (!item) return [];

  const itemRelations = relations.filter((r) => r.itemId === itemId);

  return itemRelations.map((r) => {
    const category = categories.find((c) => c.id === r.itemCategoryId);
    if (!category || category.userId !== user.id) return null;

    return {
      relationId: r.id,
      categoryId: category.id,
      categoryName: category.name,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function getCategoryItems(categoryId: number) {
  const user = await getUser();
  const relations = storage.getItemCategoryRelations();
  const items = storage.getItems();
  const categories = storage.getItemCategories();

  const category = categories.find((c) => c.id === categoryId && c.userId === user.id);
  if (!category) return [];

  const categoryRelations = relations.filter((r) => r.itemCategoryId === categoryId);

  return categoryRelations.map((r) => {
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

export async function assignCategory(formData: FormData) {
  const user = await getUser();
  const itemId = Number(formData.get("itemId"));
  const categoryId = Number(formData.get("categoryId"));

  const items = storage.getItems();
  const categories = storage.getItemCategories();

  const item = items.find((i) => i.id === itemId && i.userId === user.id);
  if (!item) throw redirect("/items");

  const category = categories.find((c) => c.id === categoryId && c.userId === user.id);
  if (!category) throw redirect("/items");

  const relations = storage.getItemCategoryRelations();
  const existing = relations.find((r) => r.itemId === itemId && r.itemCategoryId === categoryId);

  if (!existing) {
    const newRelation = {
      id: storage.generateId(),
      itemId,
      itemCategoryId: categoryId,
    };
    storage.saveItemCategoryRelation(newRelation);
  }
  throw redirect(`/items/${itemId}`);
}

export async function removeCategory(formData: FormData) {
  const user = await getUser();
  const relationId = Number(formData.get("relationId"));
  const itemId = Number(formData.get("itemId"));

  const relations = storage.getItemCategoryRelations();
  const items = storage.getItems();

  const relation = relations.find((r) => r.id === relationId);
  if (!relation) throw redirect(`/items/${itemId}`);

  const item = items.find((i) => i.id === relation.itemId && i.userId === user.id);
  if (!item) throw redirect(`/items/${itemId}`);

  storage.deleteItemCategoryRelation(relationId);
  throw redirect(`/items/${itemId}`);
}
