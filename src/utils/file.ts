import path from "path";
import { normalizePath } from "vite";
import { AdditionalInput } from "../../types";

export function getNormalizedFileName(
  fileName: string,
  includeExt = true
): string {
  let { dir, name, ext } = path.parse(normalizePath(path.normalize(fileName)));

  if (!dir) {
    return `${name}${includeExt ? ext : ""}`;
  }

  dir = dir.startsWith("/") ? dir.slice(1) : dir;

  return `${dir}/${name}${includeExt ? ext : ""}`;
}

export function getInputFileName(inputFileName: string, root: string): string {
  return `${root}/${getNormalizedFileName(inputFileName, true)}`;
}

export function getOutputFileName(inputFileName: string): string {
  return getNormalizedFileName(inputFileName, false);
}

export function getAdditionalInput(
  input: AdditionalInput
): Exclude<AdditionalInput, string> {
  return typeof input === "string"
    ? { fileName: input, webAccessibleResource: false }
    : input;
}
