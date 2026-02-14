import { createAuthClient } from "better-auth/solid-start";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000", // TODO: Make this dynamic or env var based
});
