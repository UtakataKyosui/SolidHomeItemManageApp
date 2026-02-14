import { redirect } from "@solidjs/router";
import { storage } from "../lib/storage";

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

export async function loginOrRegister(formData: FormData) {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateUsername(username) || validatePassword(password);
  if (error) return new Error(error);

  try {
    // 簡易的なユーザー作成・取得ロジック
    // パスワードは保存しない（あるいは平文で保存するが今回は検証しない）
    const users = storage.getUsers();
    let user = users.find(u => u.username === username);

    if (loginType === "register") {
      if (user) return new Error("User already exists");
      user = {
        id: storage.generateId(),
        username,
      };
      storage.saveUser(user);
    } else {
      if (!user) return new Error("Invalid login");
      // パスワードチェックは省略
    }

    // セッション管理は省略し、LocalStorageにcurrentUserIdを保存する方式も考えられるが
    // getUser()で最初のユーザーを返す仕様にするため、ここでは何もしない

  } catch (err) {
    return err as Error;
  }
  throw redirect("/");
}

export async function logout() {
  // セッションクリアの代わりに何もしない
  throw redirect("/login");
}

export async function getUser() {
  const users = storage.getUsers();
  // 常に最初のユーザー、またはデフォルトユーザーを返す
  let user = users[0];
  if (!user) {
    // デフォルトユーザーを作成
    user = { id: 1, username: "admin" };
    storage.saveUser(user);
  }
  return { id: user.id, username: user.username };
}

export async function updateUser(formData: FormData) {
  const user = await getUser();
  const username = String(formData.get("username"));

  const error = validateUsername(username);
  if (error) return new Error(error);

  const users = storage.getUsers();
  const existing = users.find((u) => u.username === username && u.id !== user.id);
  if (existing) return new Error("Username already taken");

  const updatedUser = {
    id: user.id, // userオブジェクトはIDとusernameしか持っていない（getUserの戻り値）
    username,
  };
  // getUserが返すのは {id, username} だが、storage.saveUser は User型 {id, username} を期待する。
  // getUserの実装を見ると { id: user.id, username: user.username } を返している。
  // storage.tsのUser型も { id: number, username: string } なので互換性あり。

  storage.saveUser(updatedUser);
  throw redirect("/settings");
}
