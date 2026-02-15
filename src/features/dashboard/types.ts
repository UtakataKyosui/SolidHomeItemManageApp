export interface DashboardStats {
  itemCount: number | string;
  categoryCount: number | string;
  storageCount: number | string;
  boxCount: number | string;
  recentItems: RecentItem[];
}

export interface RecentItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type DashboardStatsResult = DashboardStats | { needsSetup: true };
