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
});
