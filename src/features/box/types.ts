import type { useSubmission } from "@solidjs/router";
import type { JSX } from "solid-js";

export interface Box {
  id: string;
  name: string;
  userId: string;
  storageId: string | null;
}

export interface BoxWithStorage extends Box {
  storageName: string;
  isDefault?: boolean;
}

export type StorageOption = { id: string; name: string };

export type BoxFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  storages: StorageOption[];
  initial?: { id: string; name: string; storageId: string | null };
  submission: ReturnType<typeof useSubmission>;
};
