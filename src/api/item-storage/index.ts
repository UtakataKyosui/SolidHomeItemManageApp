import { action, query } from "@solidjs/router";
import {
  getItemStorages as gIS,
  getStorageItems as gSI,
  assignStorage as aS,
  removeStorage as rS,
} from "./server";

export const getItemStorages = query(gIS, "itemStorages");
export const getStorageItems = query(gSI, "storageItems");
export const assignStorage = action(aS, "assignStorage");
export const removeStorage = action(rS, "removeStorage");
