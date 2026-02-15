import { useSubmission, type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";
import { createStorage } from "~/features/storage";
import { StorageForm } from "~/features/storage/StorageForm";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

export default function NewStorage() {
  const submission = useSubmission(createStorage);

  return (
    <StorageForm
      action={createStorage}
      submitLabel="作成"
      submission={submission}
    />
  );
}
