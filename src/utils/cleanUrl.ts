const postfixRE = /[?#].*$/s;

export default function cleanUrl(url: string): string {
  return url.replace(postfixRE, "");
}
