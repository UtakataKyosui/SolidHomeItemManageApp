import { createAsync, type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";
import { getCategories } from "~/features/category";
import { CategoryList } from "~/features/category/CategoryList";

export const route = {
  preload() {
    getUser();
    getCategories();
  },
} satisfies RouteDefinition;

export default function CategoryListPage() {
  const categories = createAsync(() => getCategories());
  return <CategoryList items={categories} />;
}
