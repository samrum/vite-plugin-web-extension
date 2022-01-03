import type { Plugin } from "vite";

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

// TODO: Have this automatically included on plugin usage
interface ImportMeta {
  CURRENT_CONTENT_SCRIPT_CSS_URL?: string;
}
