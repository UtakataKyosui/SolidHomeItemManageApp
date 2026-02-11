// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { Link } from "./components/ui/link";
import "./app.css";
import { css } from "styled-system/css";
import { Text } from "./components/ui/text";

export default function App() {
  return (
    <Router
      root={props => (
        <>
          <nav class={`${css({
            borderRadius: "8px",
            bgColor: "slate.200",
            borderColor: "slate.100",
            borderWidth: "1px",
            padding: "2",
            margin: "2",
            paddingLeft: "4",
            paddingRight: "4",
            display: "flex",
            alignItems: "center",
            gap: "4"
          })}`}>
            <Link textDecoration="none" href="/" variant="plain" textStyle="xl" fontWeight="bold">
              Initialize Home
            </Link>
            <div class={css({
              "& a": {
                color: "black",
                padding: "1",
                textDecorationLine: "underline",
                "&:hover": {
                  color: "gray.400",
                  bgColor: "white.a3",
                  borderRadius: "8px",
                },
              }
            })}>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </nav>
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
