import {
  useSubmission,
  type RouteSectionProps
} from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { css } from "styled-system/css";
import { loginOrRegister } from "~/api";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Fieldset from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import * as RadioGroup from "~/components/ui/radio-group";
import * as Card from "~/components/ui/card";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);
  const [loginType, setLoginType] = createSignal("login");

  return (
    <Card.Root class={css({
      width: { base: "95%", md: "80%" },
      margin: "0 auto",
    })}>
      <form action={loginOrRegister} method="post" aria-describedby={loggingIn.result instanceof Error ? "error-message" : undefined}>
        <Card.Header>
          <Card.Title>Login or Register</Card.Title>
        </Card.Header>
        <Card.Body>
          <input type="hidden" name="redirectTo" value={props.params.redirectTo ?? "/"} />
          <Fieldset.Root>
            <Fieldset.Legend>Login or Register?</Fieldset.Legend>
            <RadioGroup.Root onValueChange={(e) => {
              setLoginType(e.value as "login" | "register");
            }} name="loginType" defaultValue="login" flexDir="row" gap="2" padding="2">
              <RadioGroup.Item value="login">
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>Login</RadioGroup.ItemText>
                <RadioGroup.ItemHiddenInput />
              </RadioGroup.Item>
              <RadioGroup.Item value="register">
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>Register</RadioGroup.ItemText>
                <RadioGroup.ItemHiddenInput />
              </RadioGroup.Item>
            </RadioGroup.Root>
          </Fieldset.Root>
          <Field.Root>
            <Field.Label>Username</Field.Label>
            <Input name="username" placeholder="kody" autocomplete="username" required />
          </Field.Root>
          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input name="password" type="password" placeholder="twixrox" autocomplete="current-password" required />
          </Field.Root>
        </Card.Body>
        <Card.Footer display="flex" flexDirection="column" >
          <Button type="submit">{loginType() === "login" ? "Login" : "Register"}</Button>
          <Show when={loggingIn.result instanceof Error}>
            <p style={{ color: "red" }} role="alert" id="error-message">
              {(loggingIn.result as Error).message}
            </p>
          </Show>
        </Card.Footer>
      </form>
    </Card.Root>
  );
}
