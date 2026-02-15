import { createAsync, useParams, useSubmission, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";
import { getUser } from "~/api";
import { getCategory, updateCategory } from "~/features/category";
import { CategoryForm } from "~/features/category/CategoryForm";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function EditCategory() {
  const params = useParams();
  const category = createAsync(() => getCategory(params.id!));
  const submission = useSubmission(updateCategory);

  return (
    <Show when={category()}>
      {(c) => (
        <CategoryForm
          action={updateCategory}
          submitLabel="更新"
          initial={c()}
          submission={submission}
        />
      )}
    </Show>
  );
}
