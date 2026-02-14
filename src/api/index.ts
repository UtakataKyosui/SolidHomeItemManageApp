import { action, query } from "@solidjs/router";
import { getUser as gU, logout as l } from "./server";

export const getUser = query(gU, "user");
export const logout = action(l, "logout");