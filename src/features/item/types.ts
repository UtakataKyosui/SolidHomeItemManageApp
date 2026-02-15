import { useSubmission } from "@solidjs/router";
import type { JSX } from "solid-js";

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  userId: string;
}

export type ItemFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: { id: string; name: string; description: string; price: number; quantity: number; image?: string | null };
  submission: ReturnType<typeof useSubmission>;
};
