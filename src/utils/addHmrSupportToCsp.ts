import parse from "content-security-policy-parser";

export const addHmrSupportToCsp = (
  hmrServerOrigin: string,
  inlineScriptHashes: Set<string>,
  contentSecurityPolicyStr?: string | undefined
): string => {
  const inlineScriptHashesArr = Array.from(inlineScriptHashes);
  const scriptSrcs = ["'self'", hmrServerOrigin].concat(
    inlineScriptHashesArr || []
  );

  const contentSecurityPolicy = parse(contentSecurityPolicyStr || "");
  contentSecurityPolicy["script-src"] = scriptSrcs.concat(
    contentSecurityPolicy["script-src"]
  );
  contentSecurityPolicy["object-src"] = ["'self'"].concat(
    contentSecurityPolicy["object-src"]
  );

  return Object.keys(contentSecurityPolicy)
    .map((key) => {
      return (
        `${key} ` +
        contentSecurityPolicy[key]
          .filter((c, idx) => contentSecurityPolicy[key].indexOf(c) === idx) // Dedupe
          .join(" ")
      );
    })
    .join("; ");
};
