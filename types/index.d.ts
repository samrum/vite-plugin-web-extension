import type { Plugin, ChunkMetadata } from "vite";

interface ViteWebExtensionOptions {
  /**
   * The manifest file to use as a base for the generated extension
   */
  manifest: chrome.runtime.Manifest;
}

/**
 * Build cross platform, module-based web extensions using vite
 */
export default function webExtension(options?: ViteWebExtensionOptions): Plugin;

declare module "rollup" {
  export interface RenderedChunk {
    viteMetadata: ChunkMetadata;
  }
}
