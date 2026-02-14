import { useSubmission } from "@solidjs/router";
import { Show, For, type JSX } from "solid-js";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Card from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { css } from "styled-system/css";

type StorageOption = { id: number; name: string };

type BoxFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  storages: StorageOption[];
  initial?: { id: number; name: string; storageId: number };
  submission: ReturnType<typeof useSubmission>;
};

export function BoxForm(props: BoxFormProps) {
  return (
    <Card.Root class={css({ width: "80%", margin: "0 auto" })}>
      <form action={props.action} method="post" aria-describedby={props.submission.result instanceof Error ? "error-message" : undefined}>
        <Card.Header>
          <Card.Title>
            {props.initial ? "ボックスを編集" : "ボックスを追加"}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Show when={props.initial}>
            <input type="hidden" name="id" value={props.initial!.id} />
          </Show>
          <div class={css({ display: "flex", flexDirection: "column", gap: "4" })}>
            <Field.Root>
              <Field.Label>名前</Field.Label>
              <Input
                name="name"
                placeholder="例: 上段"
                value={props.initial?.name ?? ""}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label for="storage-select">収納場所</Field.Label>
              <select
                id="storage-select"
                name="storageId"
                value={props.initial?.storageId ?? ""}
                class={css({
                  borderWidth: "1px", borderRadius: "l2", px: "3", py: "2",
                  textStyle: "sm", bg: "transparent", cursor: "pointer", w: "full",
                })}
              >
                <option value="">収納場所を選択...</option>
                <For each={props.storages}>
                  {(s) => <option value={s.id}>{s.name}</option>}
                </For>
              </select>
            </Field.Root>
          </div>
        </Card.Body>
        <Card.Footer>
          <Button type="submit">{props.submitLabel}</Button>
          <Show when={props.submission.result instanceof Error}>
            <p style={{ color: "red" }} role="alert" id="error-message">
              {(props.submission.result as Error).message}
            </p>
          </Show>
        </Card.Footer>
      </form>
    </Card.Root>
  );
}
