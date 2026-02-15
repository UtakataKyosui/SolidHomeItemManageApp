import { createAsync, type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";
import { getItems } from "~/features/item";
import { PageContainer } from "~/components/ui/container";
import { ItemList } from "~/features/item/ItemList";

export const route = {
  preload() {
    getUser();
    getItems();
  },
} satisfies RouteDefinition;

export default function ItemListPage() {
  const items = createAsync(() => getItems());

  return (
    <PageContainer>
      <ItemList items={items()} />
    </PageContainer>
  );
}
