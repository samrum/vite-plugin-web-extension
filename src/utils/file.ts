import path from "path";

export function getOutputFileName(inputFileName: string): string {
  let { dir, name } = path.parse(path.normalize(inputFileName));

  if (!dir) {
    return name;
  }

  dir = dir.startsWith("/") ? dir.slice(1) : dir;

  return `${dir}/${name}`;
}

export function isSingleHtmlFilename(fileName: string): boolean {
  return /[^*]+.html$/.test(fileName);
}
