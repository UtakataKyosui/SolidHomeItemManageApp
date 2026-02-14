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
            bgColor: "nav.bg",
            borderColor: "nav.border",
            borderWidth: "1px",
            padding: "2",
            margin: "2",
            marginBottom: "4",
            paddingLeft: "4",
            paddingRight: "4",
            display: "flex",
            alignItems: { base: "stretch", md: "center" },
            flexDirection: { base: "column", md: "row" },
            gap: { base: "2", md: "4" },
            zIndex: "100"
          })}>
            <Link textDecoration="none" href="/" variant="plain" textStyle="xl" fontWeight="bold">
              Initialize Home
            </Link>
            <ul class={css({
              display: "flex",
              gap: "2",
              margin: 0,
              padding: 0,
              listStyle: "none",
              overflowX: "auto",
              maxWidth: { base: "100%", md: "unset" },
              whiteSpace: "nowrap",
              maskImage: { base: "linear-gradient(to right, black 90%, transparent 100%)", md: "none" },
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
              <li><Link href="/dashboard"><LayoutDashboard size={16} /> ダッシュボード</Link></li>
              <li><Link href="/items"><Package size={16} /> アイテム</Link></li>
              <li><Link href="/categories"><FolderOpen size={16} /> カテゴリ</Link></li>
              <li><Link href="/boxes"><Box size={16} /> ボックス</Link></li>
              <li><Link href="/storages"><Archive size={16} /> 収納場所</Link></li>
            </ul>
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
