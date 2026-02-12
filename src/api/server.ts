"use server";
import { redirect } from "@solidjs/router";
import { useSession } from "vinxi/http";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { Users } from "../../drizzle/schema";

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

async function login(username: string, password: string) {
  const user = db.select().from(Users).where(eq(Users.username, username)).get();
  if (!user || !(await Bun.password.verify(password, user.password))) throw new Error("Invalid login");
  return user;
}

async function register(username: string, password: string) {
  const existingUser = db.select().from(Users).where(eq(Users.username, username)).get();
  if (existingUser) throw new Error("User already exists");
  const hashedPassword = await Bun.password.hash(password);
  return db.insert(Users).values({ username, password: hashedPassword }).returning().get();
}

function getSession() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return useSession({
    password: secret
  });
}

export async function loginOrRegister(formData: FormData) {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateUsername(username) || validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await (loginType === "register"
      ? register(username, password)
      : login(username, password));
    const session = await getSession();
    await session.update(d => {
      d.userId = user.id;
    });
  } catch (err) {
    return err as Error;
  }
  throw redirect("/");
}

export async function logout() {
  const session = await getSession();
  await session.update(d => (d.userId = undefined));
  throw redirect("/login");
}

export async function getUser() {
  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw redirect("/login");

  const user = db.select().from(Users).where(eq(Users.id, userId)).get();
  if (!user) await logout();
  return { id: user.id, username: user.username };
}
