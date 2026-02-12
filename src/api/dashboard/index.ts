import { query } from "@solidjs/router";
import { getDashboardStats as gDS } from "./server";

export const getDashboardStats = query(gDS, "dashboardStats");
