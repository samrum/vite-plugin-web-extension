import path from "path";

export function getNormalizedFileName(
  fileName: string,
  includeExt = true
): string {
  let { dir, name, ext } = path.parse(path.normalize(fileName));

  if (!dir) {
    return `${name}${includeExt ? ext : ""}`;
  }

  dir = dir.startsWith("/") ? dir.slice(1) : dir;

  return `${dir}/${name}${includeExt ? ext : ""}`;
}

export function getOutputFileName(inputFileName: string): string {
  return getNormalizedFileName(inputFileName, false);
}

export function isSingleHtmlFilename(fileName: string): boolean {
  return /[^*]+.html$/.test(fileName);
}
