import { useSubmission } from "@solidjs/router";
import { Show, type JSX } from "solid-js";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Card from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { css } from "styled-system/css";
import { PageContainer } from "~/components/ui/container";

type StorageFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: { id: string; name: string };
  submission: ReturnType<typeof useSubmission>;
};

export function StorageForm(props: StorageFormProps) {
  return (
    <PageContainer>
      <Card.Root>
        <form action={props.action} method="post" aria-describedby={props.submission.result instanceof Error ? "error-message" : undefined}>
          <Card.Header>
            <Card.Title>
              {props.initial ? "収納場所を編集" : "収納場所を追加"}
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
                placeholder="例: リビングの棚"
                value={props.initial?.name ?? ""}
              />
            </Field.Root>
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
    </PageContainer>
  );
}
