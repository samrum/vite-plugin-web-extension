import { describe, expect, it } from "vitest";
import parse from "content-security-policy-parser";

import { addHmrSupportToCsp } from "./../../src/utils/addHmrSupportToCsp";

const basicCsp =
  "script-src 'self' https://app.foo.com; connect-src https://*.googleapis.com; image-src 'self'; object-src 'self'";
const basicCspWithDupes =
  "script-src 'self' https://app.foo.com 'self'; connect-src https://*.googleapis.com; image-src 'self'; object-src 'none' 'none'";

describe("Creating an HMR friendly CSP document", () => {
  it("should work without a passed in existing CSP", () => {
    const cspStr = addHmrSupportToCsp("http://localhost:5173", []);
    const csp = parse(cspStr);

    expect(csp["script-src"].length).toEqual(2);
    expect(csp["script-src"]).toContain("'self'");
    expect(csp["script-src"]).toContain("http://localhost:5173");
    expect(csp["object-src"].length).toEqual(1);
    expect(csp["object-src"]).toContain("'self'");
  });
  it("should let us pass in our own document", () => {
    const cspStr = addHmrSupportToCsp("http://localhost:5173", [], basicCsp);
    const csp = parse(cspStr);

    expect(csp["script-src"].length).toEqual(3);
    expect(csp["object-src"].length).toEqual(1);
  });
  it("should let us include inline hashes", () => {
    const cspStr = addHmrSupportToCsp(
      "http://localhost:5173",
      new Set([
        "sha256-B2yPHKaXnvFWtRChIbabYmUBFZdVfKKXHbWtWidDVF8=",
        "sha256-B2yPHKaXnvFWtRChIbabYmUBFZdVfKKXHbWtWidDVF7=",
      ]),
      basicCsp
    );
    const csp = parse(cspStr);

    expect(csp["script-src"].length).toEqual(5);
  });

  it("should let dedupe values", () => {
    const cspStr = addHmrSupportToCsp(
      "http://localhost:5173",
      new Set([
        "sha256-B2yPHKaXnvFWtRChIbabYmUBFZdVfKKXHbWtWidDVF8=",
        "sha256-B2yPHKaXnvFWtRChIbabYmUBFZdVfKKXHbWtWidDVF7=",
      ]),
      basicCspWithDupes
    );
    const csp = parse(cspStr);

    expect(csp["script-src"].length).toEqual(5);
    expect(csp["object-src"].length).toEqual(2);
  });
});
