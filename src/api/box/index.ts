import { action, query } from "@solidjs/router";
import {
  getBoxes as gB,
  getBoxesByStorage as gBS,
  getBox as gBi,
  getAllBoxesWithStorage as gABWS,
  createBox as cB,
  updateBox as uB,
  deleteBox as dB,
} from "./server";

export const getBoxes = query(gB, "boxes");
export const getBoxesByStorage = query(gBS, "boxesByStorage");
export const getBox = query(gBi, "box");
export const getAllBoxesWithStorage = query(gABWS, "allBoxesWithStorage");
export const createBox = action(cB, "createBox");
export const updateBox = action(uB, "updateBox");
export const deleteBox = action(dB, "deleteBox");
