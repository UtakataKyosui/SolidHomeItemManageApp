import { useSubmission, type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";
import { createItem } from "~/features/item";
import { ItemForm } from "~/features/item/ItemForm";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function NewItem() {
  const submission = useSubmission(createItem);

  return (
    <ItemForm
      action={createItem}
      submitLabel="作成"
      submission={submission}
    />
  );
}
