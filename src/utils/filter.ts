import { createFilter } from "vite";
import { ViteWebExtensionOptions } from "../../types";

export function createWebAccessibleScriptsFilter(
  scriptFilterOption: ViteWebExtensionOptions["webAccessibleScripts"]
): ReturnType<typeof createFilter> {
  return createFilter(
    scriptFilterOption?.include || /\.([cem]?js|ts)$/,
    scriptFilterOption?.exclude || "",
    scriptFilterOption?.options
  );
}
