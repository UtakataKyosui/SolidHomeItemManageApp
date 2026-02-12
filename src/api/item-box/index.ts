import { action, query } from "@solidjs/router";
import {
  getItemBoxes as gIB,
  getBoxItems as gBI,
  getStorageBoxesWithItems as gSBWI,
  assignBox as aB,
  removeBox as rB,
} from "./server";

export const getItemBoxes = query(gIB, "itemBoxes");
export const getBoxItems = query(gBI, "boxItems");
export const getStorageBoxesWithItems = query(gSBWI, "storageBoxesWithItems");
export const assignBox = action(aB, "assignBox");
export const removeBox = action(rB, "removeBox");
