import { action, query } from "@solidjs/router";
import { getUser as gU } from "./server";

export const getUser = query(gU, "user");