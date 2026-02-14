import { isServer } from "solid-js/web";

// 型定義 (drizzle/schema.ts に対応)
export type User = {
    id: number;
    username: string;
};

export type Item = {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    image: string | null;
    userId: number;
};

export type ItemCategory = {
    id: number;
    name: string;
    userId: number;
};

export type ItemCategoryRelation = {
    id: number;
    itemId: number;
    itemCategoryId: number;
};

export type Storage = {
    id: number;
    name: string;
    userId: number;
};

export type Box = {
    id: number;
    name: string;
    userId: number;
    storageId: number;
    isDefault: boolean;
};

export type BoxRelation = {
    id: number;
    itemId: number;
    boxId: number;
};

// Storage Keys
const STORAGE_KEYS = {
    USERS: "app_users",
    ITEMS: "app_items",
    ITEM_CATEGORIES: "app_item_categories",
    ITEM_CATEGORY_RELATIONS: "app_item_category_relations",
    STORAGES: "app_storages",
    BOXES: "app_boxes",
    BOX_RELATIONS: "app_box_relations",
} as const;

class StorageClient {
    private getItem<T>(key: string): T[] {
        if (isServer) return [];
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    private setItem<T>(key: string, data: T[]) {
        if (isServer) return;
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ID生成 (簡易版: 現在時刻 + ランダム)
    generateId(): number {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    // Users
    getUsers(): User[] {
        return this.getItem<User>(STORAGE_KEYS.USERS);
    }
    saveUser(user: User) {
        const users = this.getUsers();
        const index = users.findIndex((u) => u.id === user.id);
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        this.setItem(STORAGE_KEYS.USERS, users);
    }

    // Items
    getItems(): Item[] {
        return this.getItem<Item>(STORAGE_KEYS.ITEMS);
    }
    saveItem(item: Item) {
        const items = this.getItems();
        const index = items.findIndex((i) => i.id === item.id);
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        this.setItem(STORAGE_KEYS.ITEMS, items);
    }
    deleteItem(id: number) {
        const items = this.getItems().filter((i) => i.id !== id);
        this.setItem(STORAGE_KEYS.ITEMS, items);
    }

    // Item Categories
    getItemCategories(): ItemCategory[] {
        return this.getItem<ItemCategory>(STORAGE_KEYS.ITEM_CATEGORIES);
    }
    saveItemCategory(category: ItemCategory) {
        const categories = this.getItemCategories();
        const index = categories.findIndex((c) => c.id === category.id);
        if (index >= 0) {
            categories[index] = category;
        } else {
            categories.push(category);
        }
        this.setItem(STORAGE_KEYS.ITEM_CATEGORIES, categories);
    }
    deleteItemCategory(id: number) {
        const categories = this.getItemCategories().filter((c) => c.id !== id);
        this.setItem(STORAGE_KEYS.ITEM_CATEGORIES, categories);
    }

    // Item Category Relations
    getItemCategoryRelations(): ItemCategoryRelation[] {
        return this.getItem<ItemCategoryRelation>(STORAGE_KEYS.ITEM_CATEGORY_RELATIONS);
    }
    saveItemCategoryRelation(relation: ItemCategoryRelation) {
        const relations = this.getItemCategoryRelations();
        relations.push(relation);
        this.setItem(STORAGE_KEYS.ITEM_CATEGORY_RELATIONS, relations);
    }
    deleteItemCategoryRelationsByItemId(itemId: number) {
        const relations = this.getItemCategoryRelations().filter((r) => r.itemId !== itemId);
        this.setItem(STORAGE_KEYS.ITEM_CATEGORY_RELATIONS, relations);
    }
    deleteItemCategoryRelationsByCategoryId(categoryId: number) {
        const relations = this.getItemCategoryRelations().filter((r) => r.itemCategoryId !== categoryId);
        this.setItem(STORAGE_KEYS.ITEM_CATEGORY_RELATIONS, relations);
    }
    deleteItemCategoryRelation(id: number) {
        const relations = this.getItemCategoryRelations().filter((r) => r.id !== id);
        this.setItem(STORAGE_KEYS.ITEM_CATEGORY_RELATIONS, relations);
    }

    // Storages
    getStorages(): Storage[] {
        return this.getItem<Storage>(STORAGE_KEYS.STORAGES);
    }
    saveStorage(storage: Storage) {
        const storages = this.getStorages();
        const index = storages.findIndex((s) => s.id === storage.id);
        if (index >= 0) {
            storages[index] = storage;
        } else {
            storages.push(storage);
        }
        this.setItem(STORAGE_KEYS.STORAGES, storages);
    }
    deleteStorage(id: number) {
        const storages = this.getStorages().filter((s) => s.id !== id);
        this.setItem(STORAGE_KEYS.STORAGES, storages);
    }

    // Boxes
    getBoxes(): Box[] {
        return this.getItem<Box>(STORAGE_KEYS.BOXES);
    }
    saveBox(box: Box) {
        const boxes = this.getBoxes();
        const index = boxes.findIndex((b) => b.id === box.id);
        if (index >= 0) {
            boxes[index] = box;
        } else {
            boxes.push(box);
        }
        this.setItem(STORAGE_KEYS.BOXES, boxes);
    }
    deleteBox(id: number) {
        const boxes = this.getBoxes().filter((b) => b.id !== id);
        this.setItem(STORAGE_KEYS.BOXES, boxes);
    }

    // Box Relations
    getBoxRelations(): BoxRelation[] {
        return this.getItem<BoxRelation>(STORAGE_KEYS.BOX_RELATIONS);
    }
    saveBoxRelation(relation: BoxRelation) {
        const relations = this.getBoxRelations();
        relations.push(relation);
        this.setItem(STORAGE_KEYS.BOX_RELATIONS, relations);
    }
    deleteBoxRelationsByItemId(itemId: number) {
        const relations = this.getBoxRelations().filter((r) => r.itemId !== itemId);
        this.setItem(STORAGE_KEYS.BOX_RELATIONS, relations);
    }
    deleteBoxRelationsByBoxId(boxId: number) {
        const relations = this.getBoxRelations().filter((r) => r.boxId !== boxId);
        this.setItem(STORAGE_KEYS.BOX_RELATIONS, relations);
    }
    deleteBoxRelation(id: number) {
        const relations = this.getBoxRelations().filter((r) => r.id !== id);
        this.setItem(STORAGE_KEYS.BOX_RELATIONS, relations);
    }
}

export const storage = new StorageClient();
