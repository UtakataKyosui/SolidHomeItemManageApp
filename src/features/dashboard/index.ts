import { query } from "@solidjs/router";
import { getDashboardStats as gDS } from "./handlers";

export type { DashboardStats, RecentItem, DashboardStatsResult } from "./types";

export const getDashboardStats = query(gDS, "dashboardStats");
