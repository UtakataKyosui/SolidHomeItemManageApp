import { action, query } from "@solidjs/router";
import {
  getItemCategories as gIC,
  getCategoryItems as gCI,
  assignCategory as aC,
  removeCategory as rC,
} from "./handlers";

export const getItemCategories = query(gIC, "itemCategories");
export const getCategoryItems = query(gCI, "categoryItems");
export const assignCategory = action(aC, "assignCategory");
export const removeCategory = action(rC, "removeCategory");
