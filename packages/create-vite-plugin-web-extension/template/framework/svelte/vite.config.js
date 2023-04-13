import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import { getManifest } from "./src/manifest.js";

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
        "~": new URL("./src", import.meta.url).pathname,
      },
    },
  };
});
