import { useSubmission, type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";
import { createCategory } from "~/api/category";
import { CategoryForm } from "~/components/category/CategoryForm";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function NewCategory() {
  const submission = useSubmission(createCategory);

  return (
    <CategoryForm
      action={createCategory}
      submitLabel="作成"
      submission={submission}
    />
  );
}
