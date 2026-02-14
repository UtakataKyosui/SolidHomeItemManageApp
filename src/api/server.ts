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
    // If no user found, create the default one.
    user = {
      id: DEFAULT_USER_ID,
      username: DEFAULT_USERNAME,
    };
    storage.saveUser(user);
    // In single user mode, we don't really need sessions, but setting it just in case logic depends on it.
    storage.setSession(user.id);
  }

  return { id: user.id, username: user.username };
}

export const updateUser = action(async (formData: FormData) => {
  const user = await getUser();
  const username = String(formData.get("username"));

  const error = validateUsername(username);
  if (error) return new Error(error);

  // In single user mode, we enable updating the single user's username.
  // No need to check for duplicates against other users since there is only one user.

  const updatedUser = {
    id: user.id,
    username,
  };

  storage.saveUser(updatedUser);
  throw redirect("/settings");
});
