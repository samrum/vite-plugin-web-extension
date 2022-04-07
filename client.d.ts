interface ImportMeta {
  PLUGIN_WEB_EXT_CHUNK_CSS_PATHS: string[];
}

declare module "@samrum/vite-plugin-web-extension/client" {
  export function addViteStyleTarget(element: Node): Promise<void>;
}
