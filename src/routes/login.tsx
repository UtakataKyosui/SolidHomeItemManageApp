import { type RouteSectionProps } from "@solidjs/router";
import { css } from "styled-system/css";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";

export default function Login(props: RouteSectionProps) {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "notion",
      callbackURL: "/dashboard",
    });
  };

  return (
    <Card.Root class={css({
      width: { base: "95%", md: "80%" },
      margin: "0 auto",
      marginTop: "2rem",
    })}>
      <Card.Header>
        <Card.Title>Login</Card.Title>
      </Card.Header>
      <Card.Body display="flex" flexDirection="column" gap="4" alignItems="center">
        <p>Login with your Notion account to continue.</p>
        <Button onClick={handleLogin}>
          Login with Notion
        </Button>
      </Card.Body>
    </Card.Root>
  );
}
