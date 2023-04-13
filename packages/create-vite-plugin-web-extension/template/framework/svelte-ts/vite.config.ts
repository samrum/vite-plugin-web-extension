import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      svelte(),
      webExtension({
        manifest: getManifest(),
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
  };
});
