import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * ユーザー
 * @table users
 * @description ユーザー情報
 */
export const Users = sqliteTable("users", {
  id: integer("id").primaryKey().unique().notNull(),
  username: text("username").notNull().default(""),
  password: text("password").notNull().default(""),
});

/**
 * アイテム
 * @table items
 * @description アイテム情報
 */
export const Items = sqliteTable("items", {
  id: integer("id").primaryKey().unique().notNull(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  price: integer("price").notNull().default(0),
  quantity: integer("quantity").notNull().default(0),
  userId: integer("user_id").notNull().default(0),
});

/**
 * アイテムカテゴリ
 * @table item_categories
 * @description アイテムカテゴリ情報
 */
export const ItemCategories = sqliteTable("item_categories", {
  id: integer("id").primaryKey().unique().notNull(),
  name: text("name").notNull().default(""),
  userId: integer("user_id").notNull().default(0),
});

/**
 * アイテムカテゴリリレーション
 * @table item_category_relations
 * @description アイテムカテゴリリレーション情報
 */
export const ItemCategoryRelations = sqliteTable("item_category_relations", {
  id: integer("id").primaryKey().unique().notNull(),
  itemId: integer("item_id").notNull().default(0),
  itemCategoryId: integer("item_category_id").notNull().default(0),
});

/**
 * 収納場所
 * @table storages
 * @description 収納場所情報
 */
export const Storage = sqliteTable("storages", {
  id: integer("id").primaryKey().unique().notNull(),
  name: text("name").notNull().default(""),
  userId: integer("user_id").notNull().default(0),
});

/**
 * 収納場所リレーション
 * @table storage_relations
 * @description 収納場所リレーション情報
 */
export const StorageRelations = sqliteTable("storage_relations", {
  id: integer("id").primaryKey().unique().notNull(),
  itemId: integer("item_id").notNull().default(0),
  storageId: integer("storage_id").notNull().default(0),
});

/**
 * ボックス
 * @table boxes
 * @description ボックス情報
 */
export const Boxes = sqliteTable("boxes", {
  id: integer("id").primaryKey().unique().notNull(),
  name: text("name").notNull().default(""),
  userId: integer("user_id").notNull().default(0),
  storageId: integer("storage_id").notNull().default(0),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
});

/**
 * ボックスリレーション
 * @table box_relations
 * @description ボックスリレーション情報
 */
export const BoxRelations = sqliteTable("box_relations", {
  id: integer("id").primaryKey().unique().notNull(),
  itemId: integer("item_id").notNull().default(0),
  boxId: integer("box_id").notNull().default(0),
});
