import {
  useSubmission,
  type RouteSectionProps
} from "@solidjs/router";
import { Show } from "solid-js";
import { loginOrRegister } from "~/api";
import { Button } from "~/components/ui/button";
import * as Field from "~/components/ui/field";
import * as Fieldset from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import * as RadioGroup from "~/components/ui/radio-group";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);

  return (
    <main>
      <form action={loginOrRegister} method="post">
        <input type="hidden" name="redirectTo" value={props.params.redirectTo ?? "/"} />
        <Fieldset.Root>
          <Fieldset.Legend>Login or Register?</Fieldset.Legend>
          <RadioGroup.Root name="loginType" defaultValue="login">
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
          <Input name="username" placeholder="kody" autocomplete="username" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Password</Field.Label>
          <Input name="password" type="password" placeholder="twixrox" autocomplete="current-password" />
        </Field.Root>
        <Button type="submit">Login</Button>
        <Show when={loggingIn.result}>
          <p style={{ color: "red" }} role="alert" id="error-message">
            {loggingIn.result!.message}
          </p>
        </Show>
      </form>
    </main>
  );
}
