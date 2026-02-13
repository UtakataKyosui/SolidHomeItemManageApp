import { useSubmission } from "@solidjs/router";
import { Show, type JSX } from "solid-js";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Card from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { css } from "styled-system/css";

type CategoryFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: { id: number; name: string };
  submission: ReturnType<typeof useSubmission>;
};

export function CategoryForm(props: CategoryFormProps) {
  return (
    <Card.Root class={css({ width: "80%", margin: "0 auto" })}>
      <form action={props.action} method="post" aria-describedby={props.submission.result ? "error-message" : undefined}>
        <Card.Header>
          <Card.Title>
            {props.initial ? "カテゴリを編集" : "カテゴリを追加"}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Show when={props.initial}>
            <input type="hidden" name="id" value={props.initial!.id} />
          </Show>
          <Field.Root>
            <Field.Label>名前</Field.Label>
            <Input
              name="name"
              placeholder="例: 掃除用品"
              value={props.initial?.name ?? ""}
            />
          </Field.Root>
        </Card.Body>
        <Card.Footer>
          <Button type="submit">{props.submitLabel}</Button>
          <Show when={props.submission.result}>
            <p style={{ color: "red" }} role="alert" id="error-message">
              {(props.submission.result as Error)!.message}
            </p>
          </Show>
        </Card.Footer>
      </form>
    </Card.Root>
  );
}
