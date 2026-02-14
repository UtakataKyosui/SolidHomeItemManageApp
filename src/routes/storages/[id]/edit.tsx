import { createAsync, useParams, useSubmission, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";
import { getUser } from "~/api";
import { getStorage, updateStorage } from "~/api/storage";
import { StorageForm } from "~/components/storage/StorageForm";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function EditStorage() {
  const params = useParams();
  const storage = createAsync(() => getStorage(params.id!));
  const submission = useSubmission(updateStorage);

  return (
    <Show when={storage()}>
      {(s) => (
        <StorageForm
          action={updateStorage}
          submitLabel="更新"
          initial={s()}
          submission={submission}
        />
      )}
    </Show>
  );
}
