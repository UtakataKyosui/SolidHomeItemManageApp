import { action, query } from "@solidjs/router";
import {
  getStorages as gS,
  getStorage as gSi,
  createStorage as cS,
  updateStorage as uS,
  deleteStorage as dS,
} from "./server";

export const getStorages = query(gS, "storages");
export const getStorage = query(gSi, "storage");
export const createStorage = action(cS, "createStorage");
export const updateStorage = action(uS, "updateStorage");
export const deleteStorage = action(dS, "deleteStorage");
