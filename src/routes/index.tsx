import { type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

// getUser() always returns the default user in single-user mode.
// Redirect to dashboard immediately.
export default function Home() {
  // Server-side check is implicit via getUser call in preload (though preload return value isn't used here)
  // Client-side redirect to dashboard
  if (typeof window !== "undefined") {
    window.location.href = "/dashboard";
  }
  return null;
}
