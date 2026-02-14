import { type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/api";

export const route = {
  preload() {
    getUser();
  },
} satisfies RouteDefinition;

// getUser() は未認証時に /login へリダイレクトする
// 認証済みの場合はダッシュボードへリダイレクト
export default function Home() {
  // サーバーサイドで getUser が呼ばれ認証チェックされる
  // クライアントサイドではダッシュボードへ転送
  if (typeof window !== "undefined") {
    window.location.href = "/dashboard";
  }
  return null;
}
