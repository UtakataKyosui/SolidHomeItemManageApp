// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, For } from "solid-js";
import { Link } from "./components/ui/link";
import "./app.css";
import { css } from "styled-system/css";
import { LayoutDashboard, Package, FolderOpen, Archive, Box } from "lucide-solid";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/ui/theme-toggle";
import * as Dialog from "./components/ui/dialog";
import { IconButton } from "./components/ui/icon-button";
import { Menu, X } from "lucide-solid";

type NavLink = {
  href: string;
  icon: any;
  label: string;
};

const navLinks: NavLink[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "ダッシュボード" },
  { href: "/items", icon: Package, label: "アイテム" },
  { href: "/categories", icon: FolderOpen, label: "カテゴリ" },
  { href: "/boxes", icon: Box, label: "ボックス" },
  { href: "/storages", icon: Archive, label: "収納場所" },
];

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
            <div class={css({ display: "flex", alignItems: "center", gap: "2", width: "100%", justifyContent: "space-between" })}>
              <Link textDecoration="none" href="/" variant="plain" textStyle="xl" fontWeight="bold">
                Initialize Home
              </Link>

              {/* Mobile Hamburger Menu */}
              <div class={css({ display: { base: "block", md: "none" } })}>
                <Dialog.Root>
                  <Dialog.Trigger asChild={(props) => (
                    <IconButton {...props()} variant="outline" aria-label="Menu">
                      <Menu />
                    </IconButton>
                  )} />
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content class={css({
                      position: "fixed", top: "0", right: "0", h: "100vh", w: "250px", bg: "bg.default", p: "4",
                      borderLeftWidth: "1px", borderColor: "border.default", display: "flex", flexDirection: "column", gap: "4",
                      zIndex: "modal"
                    })}>
                      <div class={css({ display: "flex", justifyContent: "flex-end" })}>
                        <Dialog.CloseTrigger asChild={(props) => (
                          <IconButton {...props()} variant="plain" aria-label="Close menu">
                            <X />
                          </IconButton>
                        )} />
                      </div>
                      <nav class={css({ display: "flex", flexDirection: "column", gap: "2" })}>
                        <For each={navLinks}>
                          {(link) => (
                            <Link href={link.href} class={css({ py: "2", px: "3", borderRadius: "l2", _hover: { bg: "gray.subtle.bg" } })}>
                              <link.icon size={16} class={css({ display: "inline", mr: "2" })} /> {link.label}
                            </Link>
                          )}
                        </For>
                      </nav>
                      <div class={css({ mt: "auto" })}>
                        <ThemeToggle />
                      </div>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Dialog.Root>
              </div>

              {/* Desktop Menu */}
              <div class={css({ display: { base: "none", md: "flex" }, alignItems: "center", gap: "4" })}>
                <ul class={css({
                  display: "flex",
                  gap: "2",
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
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
                  <For each={navLinks}>
                    {(link) => (
                      <li><Link href={link.href}><link.icon size={16} /> {link.label}</Link></li>
                    )}
                  </For>
                </ul>
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <Suspense>{props.children}</Suspense>
        </ThemeProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
