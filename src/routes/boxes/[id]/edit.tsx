import { createAsync, useParams, useSubmission, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";
import { getUser } from "~/api";
import { getBox, updateBox } from "~/features/box";
import { getStorages } from "~/features/storage";
import { BoxForm } from "~/features/box/BoxForm";

export const route = {
  preload() {
    getUser();
    getStorages();
  },
} satisfies RouteDefinition;

export default function EditBox() {
  const params = useParams();
  const box = createAsync(() => getBox(params.id!));
  const storages = createAsync(() => getStorages());
  const submission = useSubmission(updateBox);

  return (
    <Show when={box() && storages()}>
      <BoxForm
        action={updateBox}
        submitLabel="更新"
        storages={storages()!}
        initial={box()!}
        submission={submission}
      />
    </Show>
  );
}
