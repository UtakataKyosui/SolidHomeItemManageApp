import { createAsync, useParams, useSubmission, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";
import { getUser } from "~/api";
import { getItem, updateItem } from "~/api/item";
import { ItemForm } from "~/components/item/ItemForm";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function EditItem() {
  const params = useParams();
  const item = createAsync(() => getItem(Number(params.id)));
  const submission = useSubmission(updateItem);

  return (
    <Show when={item()}>
      {(i) => (
        <ItemForm
          action={updateItem}
          submitLabel="更新"
          initial={i()}
          submission={submission}
        />
      )}
    </Show>
  );
}
