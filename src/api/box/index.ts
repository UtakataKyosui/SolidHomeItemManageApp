import { action, query } from "@solidjs/router";
import {
  getBoxes as getBoxesFn,
  getBoxesByStorage as getBoxesByStorageFn,
  getBox as getBoxFn,
  getAllBoxesWithStorage as getAllBoxesWithStorageFn,
  createBox as createBoxFn,
  updateBox as updateBoxFn,
  deleteBox as deleteBoxFn,
} from "./server";

export const getBoxes = query(getBoxesFn, "boxes");
export const getBoxesByStorage = query(getBoxesByStorageFn, "boxesByStorage");
export const getBox = query(getBoxFn, "box");
export const getAllBoxesWithStorage = query(getAllBoxesWithStorageFn, "allBoxesWithStorage");
export const createBox = action(createBoxFn, "createBox");
export const updateBox = action(updateBoxFn, "updateBox");
export const deleteBox = action(deleteBoxFn, "deleteBox");
