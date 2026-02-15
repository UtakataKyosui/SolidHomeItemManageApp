import { action, query } from "@solidjs/router";
import {
  getItems as gI,
  getItem as gIi,
  createItem as cI,
  updateItem as uI,
  deleteItem as dI,
} from "./handlers";

export type { Item, ItemFormProps } from "./types";

export const getItems = query(gI, "items");
export const getItem = query(gIi, "item");
export const createItem = action(cI, "createItem");
export const updateItem = action(uI, "updateItem");
export const deleteItem = action(dI, "deleteItem");
