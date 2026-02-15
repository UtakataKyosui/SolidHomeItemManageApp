import { createAsync, type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";
import { getStorages } from "~/features/storage";
import { StorageList } from "~/features/storage/StorageList";

export const route = {
  preload() {
    getUser();
    getStorages();
  },
} satisfies RouteDefinition;

export default function StorageListPage() {
  const storages = createAsync(() => getStorages());
  return <StorageList items={storages} />;
}
