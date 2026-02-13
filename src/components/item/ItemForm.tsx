import { useSubmission } from "@solidjs/router";
import { Show, type JSX } from "solid-js";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Card from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { css } from "styled-system/css";

type ItemFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: { id: number; name: string; description: string; price: number; quantity: number };
  submission: ReturnType<typeof useSubmission>;
};

export function ItemForm(props: ItemFormProps) {
  return (
    <Card.Root class={css({ width: "80%", margin: "0 auto" })}>
      <form action={props.action} method="post" aria-describedby={props.submission.result ? "error-message" : undefined}>
        <Card.Header>
          <Card.Title>
            {props.initial ? "アイテムを編集" : "アイテムを追加"}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Show when={props.initial}>
            <input type="hidden" name="id" value={props.initial!.id} />
          </Show>
          <div class={css({ display: "flex", flexDirection: "column", gap: "3" })}>
            <Field.Root>
              <Field.Label>名前</Field.Label>
              <Input name="name" placeholder="例: 掃除機" value={props.initial?.name ?? ""} />
            </Field.Root>
            <Field.Root>
              <Field.Label>説明</Field.Label>
              <Input name="description" placeholder="例: コードレスタイプ" value={props.initial?.description ?? ""} />
            </Field.Root>
            <div class={css({ display: "flex", gap: "3" })}>
              <Field.Root>
                <Field.Label>価格（円）</Field.Label>
                <Input name="price" type="number" min="0" value={String(props.initial?.price ?? 0)} />
              </Field.Root>
              <Field.Root>
                <Field.Label>数量</Field.Label>
                <Input name="quantity" type="number" min="0" value={String(props.initial?.quantity ?? 0)} />
              </Field.Root>
            </div>
          </div>
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
