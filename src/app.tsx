// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { Link } from "./components/ui/link";
import "./app.css";
import { css } from "styled-system/css";
import { LayoutDashboard, Package, FolderOpen, Archive, Box } from "lucide-solid";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/ui/theme-toggle";

export default function App() {
  return (
    <Router
      root={props => (
        <ThemeProvider>
          <nav class={css({
            position: "sticky",
            top: "2",
            borderRadius: "8px",
            bgColor: "slate.200",
            borderColor: "slate.100",
            borderWidth: "1px",
            padding: "2",
            margin: "2",
            marginBottom: "4",
            paddingLeft: "4",
            paddingRight: "4",
            display: "flex",
            alignItems: "center",
            gap: "4",
            zIndex: "100",
            _dark: {
              bgColor: "slate.800",
              borderColor: "slate.700",
            }
          })}>
            <Link textDecoration="none" href="/" variant="plain" textStyle="xl" fontWeight="bold">
              Initialize Home
            </Link>
            <div class={css({
              display: "flex",
              gap: "2",
              "& a": {
                color: "fg.default",
                padding: "1",
                paddingLeft: "2",
                paddingRight: "2",
                display: "inline-flex",
                alignItems: "center",
                gap: "1",
                textStyle: "sm",
                textDecorationLine: "none",
                borderRadius: "l2",
                "&:hover": {
                  bgColor: "white.a3",
                },
              }
            })}>
              <Link href="/dashboard"><LayoutDashboard size={16} /> ダッシュボード</Link>
              <Link href="/items"><Package size={16} /> アイテム</Link>
              <Link href="/categories"><FolderOpen size={16} /> カテゴリ</Link>
              <Link href="/boxes"><Box size={16} /> ボックス</Link>
              <Link href="/storages"><Archive size={16} /> 収納場所</Link>
            </div>
            <ThemeToggle />
          </nav>
          <Suspense>{props.children}</Suspense>
        </ThemeProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
