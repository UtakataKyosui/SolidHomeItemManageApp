import { createAsync, type RouteDefinition } from "@solidjs/router";
import { css } from "styled-system/css";
import { getUser, logout } from "~/api";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";

export const route = {
    preload() {
        getUser();
    }
} satisfies RouteDefinition;

export default function Dashboard() {
    const user = createAsync(async () => getUser(), { deferStream: true });
    return (
        <Card.Root class={css({
            width: "80%",
            margin: "0 auto",
        })}>
            <Card.Header>
                <Card.Title>Dashboard</Card.Title>
            </Card.Header>
            <Card.Body>
                <p>Hello {user()?.username}</p>
            </Card.Body>
            <Card.Footer>
                <Button onClick={() => logout()}>Logout</Button>
            </Card.Footer>
        </Card.Root>
    )
}