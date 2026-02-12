import { defineConfig } from "@solidjs/start/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  vite: {
    ssr: { external: ["drizzle-orm"] },
    resolve: {
      alias: {
        "styled-system": fileURLToPath(new URL("./styled-system", import.meta.url)),
      },
    },
  },
  solid: {
    dev: process.env.NODE_ENV !== "production",
    hot: process.env.NODE_ENV !== "production",
  }
});
