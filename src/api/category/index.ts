import { action, query } from "@solidjs/router";
import {
  getCategories as gC,
  getCategory as gCi,
  createCategory as cC,
  updateCategory as uC,
  deleteCategory as dC,
} from "./server";

export const getCategories = query(gC, "categories");
export const getCategory = query(gCi, "category");
export const createCategory = action(cC, "createCategory");
export const updateCategory = action(uC, "updateCategory");
export const deleteCategory = action(dC, "deleteCategory");
