import { action, query } from "@solidjs/router";
import {
  getItemBoxes as getItemBoxesFn,
  getBoxItems as getBoxItemsFn,
  getStorageBoxesWithItems as getStorageBoxesWithItemsFn,
  assignBox as assignBoxFn,
  removeBox as removeBoxFn,
} from "./handlers";

export const getItemBoxes = query(getItemBoxesFn, "itemBoxes");
export const getBoxItems = query(getBoxItemsFn, "boxItems");
export const getStorageBoxesWithItems = query(getStorageBoxesWithItemsFn, "storageBoxesWithItems");
export const assignBox = action(assignBoxFn, "assignBox");
export const removeBox = action(removeBoxFn, "removeBox");
