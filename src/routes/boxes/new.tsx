import { createAsync, useSubmission, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";
import { getUser } from "~/api";
import { createBox } from "~/features/box";
import { getStorages } from "~/features/storage";
import { BoxForm } from "~/features/box/BoxForm";

export const route = {
  preload() {
    getUser();
    getStorages();
  },
} satisfies RouteDefinition;

export default function NewBox() {
  const storages = createAsync(() => getStorages());
  const submission = useSubmission(createBox);

  return (
    <Show when={storages()}>
      {(s) => (
        <BoxForm
          action={createBox}
          submitLabel="作成"
          storages={s()}
          submission={submission}
        />
      )}
    </Show>
  );
}
