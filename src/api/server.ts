import { action, redirect } from "@solidjs/router";
import { storage } from "../lib/storage";

// ... (validation functions remain same)

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

// Single user mode: always return the default user (ID 1)
const DEFAULT_USER_ID = 1;
const DEFAULT_USERNAME = "User";

export async function getUser() {
  const users = storage.getUsers();
  let user = users.find((u) => u.id === DEFAULT_USER_ID);

  if (!user) {
    // Determine the next ID if 1 is somehow taken (unlikely in single user mode unless data is messed up)
    // But logically we want ID 1 to be the default user.
    // If ID 1 exists but is not the default user... handled by find.

    // If no user found, create the default one.
    user = {
      id: DEFAULT_USER_ID,
      username: DEFAULT_USERNAME,
    };
    // Ensure we don't overwrite if ID 1 exists but with different details? 
    // storage.saveUser handles update if ID exists.
    storage.saveUser(user);
    storage.setSession(user.id); // Valid session just in case
  }

  return { id: user.id, username: user.username };
}

export const updateUser = action(async (formData: FormData) => {
  const user = await getUser();
  const username = String(formData.get("username"));

  const error = validateUsername(username);
  if (error) return new Error(error);

  const users = storage.getUsers();
  const existing = users.find((u) => u.username === username && u.id !== user.id);
  if (existing) return new Error("Username already taken");

  const updatedUser = {
    id: user.id,
    username,
  };

  storage.saveUser(updatedUser);
  throw redirect("/settings");
});
