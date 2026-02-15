import type { useSubmission } from "@solidjs/router";
import type { JSX } from "solid-js";

export interface Storage {
  id: string;
  name: string;
  userId: string;
}

export type StorageFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: { id: string; name: string };
  submission: ReturnType<typeof useSubmission>;
};
