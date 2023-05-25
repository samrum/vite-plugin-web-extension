const dataUrlRE = /^\s*data:/i;

export default function isExternalUrl(url: string): boolean {
  return dataUrlRE.test(url);
}
