import { createAsync, useSubmission, type RouteDefinition } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { css } from "styled-system/css";
import { getUser, updateUser } from "~/api/server";
import { Button } from "~/components/ui/button";
import { PageContainer } from "~/components/ui/container";
import * as Field from "~/components/ui/field";
import { Input } from "~/components/ui/input";

export const route = {
    preload() {
        getUser();
    },
} satisfies RouteDefinition;

export default function Settings() {
    const user = createAsync(() => getUser());

    const [pending, setPending] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const formData = new FormData(e.target as HTMLFormElement);
        try {
            const result = await updateUser(formData);
            if (result instanceof Error) {
                setError(result.message);
            }
        } catch (err) {
            // リダイレクトや予期せぬエラー
            // リダイレクトの場合はRouterが処理するはずだが、throwされたものをキャッチしてしまった場合のために再スロー
            throw err;
        } finally {
            setPending(false);
        }
    };

    return (
        <PageContainer>
            <div class={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4" })}>
                <h1 class={css({ textStyle: "2xl", fontWeight: "bold" })}>設定</h1>
            </div>

            <Show when={user()} fallback={<div class={css({ p: 4 })}>読み込み中...</div>}>
                <div class={css({
                    p: 6,
                    bg: "bg.default",
                    rounded: "xl",
                    shadow: "sm",
                    borderWidth: "1px",
                    borderColor: "border.default",
                    maxW: "md"
                })}>
                    <h2 class={css({ textStyle: "lg", fontWeight: "bold", mb: 4 })}>プロフィール</h2>

                    <form onSubmit={handleSubmit} class={css({ spaceY: 6 })}>
                        <Field.Root>
                            <Field.Label>ユーザー名</Field.Label>
                            <Input
                                type="text"
                                name="username"
                                value={user()?.username}
                                required
                                placeholder="ユーザー名を入力"
                            />
                            <Field.HelperText>
                                アプリケーション内で表示される表示名です。
                            </Field.HelperText>

                            {error() && (
                                <Field.ErrorText class={css({ color: "red.500", display: "block", mt: 1 })}>
                                    {error()}
                                </Field.ErrorText>
                            )}
                        </Field.Root>

                        <div class={css({ display: "flex", justifyContent: "flex-end" })}>
                            <Button type="submit" disabled={pending()}>
                                {pending() ? "保存中..." : "変更を保存"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Show>
        </PageContainer>
    );
}

