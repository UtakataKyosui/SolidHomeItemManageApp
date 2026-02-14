"use server";
import { redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export async function getUser() {
  const { auth } = await import("~/lib/auth");
  const event = getRequestEvent();
  const session = await auth.api.getSession({
    headers: event?.request.headers || new Headers(),
  });
  if (!session) {
    throw redirect("/login");
  }
  return session.user;
}

export async function logout() {
  const { auth } = await import("~/lib/auth");
  // Better Auth handles logout on client side mainly, 
  // but if needed server side:
  const event = getRequestEvent();
  await auth.api.signOut({
    headers: event?.request.headers || new Headers()
  })
  throw redirect("/login");
}
