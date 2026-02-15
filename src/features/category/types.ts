import type { useSubmission } from "@solidjs/router";
import type { JSX } from "solid-js";

export interface Category {
  id: string;
  name: string;
  userId: string;
}

export type CategoryFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: { id: string; name: string };
  submission: ReturnType<typeof useSubmission>;
};
