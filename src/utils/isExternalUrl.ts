const externalRE = /^(https?:)?\/\//;

export default function isExternalUrl(url: string): boolean {
  return externalRE.test(url);
}
