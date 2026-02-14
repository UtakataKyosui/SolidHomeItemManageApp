import { useSubmission } from "@solidjs/router";
import { Show, type JSX, createSignal, onMount } from "solid-js";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Card from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { css } from "styled-system/css";

type ItemFormProps = {
  action: JSX.SerializableAttributeValue;
  submitLabel: string;
  initial?: { id: number; name: string; description: string; price: number; quantity: number; image?: string | null };
  submission: ReturnType<typeof useSubmission>;
};

export function ItemForm(props: ItemFormProps) {
  const [imagePreview, setImagePreview] = createSignal(props.initial?.image ?? "");
  const [imageBase64, setImageBase64] = createSignal(props.initial?.image ?? "");
  const [isCompressing, setIsCompressing] = createSignal(false);

  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    setIsCompressing(true);

    try {
      // Dynamic import to avoid SSR issues with WASM
      const photon = await import("@silvia-odwyer/photon");

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const pImage = photon.PhotonImage.new_from_byteslice(bytes);

      // Resize if too large (e.g., max width 800px)
      if (pImage.get_width() > 800) {
        const newHeight = Math.round((800 / pImage.get_width()) * pImage.get_height());
        const resized = photon.resize(pImage, 800, newHeight, photon.SamplingFilter.Lanczos3);
        const base64Resized = resized.get_base64();
        setImagePreview(base64Resized);
        setImageBase64(base64Resized);
        resized.free();
      } else {
        const base64Original = pImage.get_base64();
        setImagePreview(base64Original);
        setImageBase64(base64Original);
      }
      pImage.free();
    } catch (e) {
      console.error("WASM Error:", e);
    } finally {
      setIsCompressing(false);
    }
  };
  return (
    <Card.Root class={css({ width: { base: "95%", md: "80%" }, margin: "0 auto" })}>
      <form action={props.action} method="post" aria-describedby={props.submission.result instanceof Error ? "error-message" : undefined}>
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
              <Field.Label>画像 (WASM Compressed)</Field.Label>
              <div class={css({ display: "flex", alignItems: "center", gap: "4" })}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  class={css({ textStyle: "sm" })}
                />
                <Show when={isCompressing()}>
                  <span class={css({ textStyle: "sm", color: "fg.muted" })}>Compressing...</span>
                </Show>
              </div>
              <input type="hidden" name="image" value={imageBase64()} />
              <Show when={imagePreview()}>
                <img src={imagePreview()} alt="Preview" class={css({ maxHeight: "150px", borderRadius: "md", mt: "2", border: "1px solid token(colors.border.default)" })} />
              </Show>
            </Field.Root>
            <Field.Root>
              <Field.Label>説明</Field.Label>
              <Input name="description" placeholder="例: コードレスタイプ" value={props.initial?.description ?? ""} />
            </Field.Root>
            <div class={css({ display: "flex", flexDirection: { base: "column", md: "row" }, gap: "3" })}>
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
          <Button type="submit" disabled={isCompressing()}>{props.submitLabel}</Button>
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
