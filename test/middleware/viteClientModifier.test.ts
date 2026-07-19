import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { parseAst } from "vite";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import {
  addCustomStyleFunctionality,
  addServiceWorkerSupport,
} from "../../src/middleware/viteClientModifier";

// These tests run the vite client patches against the installed vite's actual
//   HMR client source so that a vite update that breaks the patches fails CI
//   instead of silently disabling web extension HMR support
describe("viteClientModifier", () => {
  let clientSource: string;

  beforeAll(async () => {
    const vitePackageJsonPath = createRequire(import.meta.url).resolve(
      "vite/package.json"
    );

    clientSource = await readFile(
      path.join(path.dirname(vitePackageJsonPath), "dist/client/client.mjs"),
      { encoding: "utf-8" }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("addCustomStyleFunctionality patches the vite client", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = addCustomStyleFunctionality(clientSource);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).not.toBe(clientSource);
    expect(result).toContain("export { addStyleTarget,");
    expect(result).toContain("function addStyleTarget");
    expect(result).toContain("styleTargetsStyleMap");
    expect(() => parseAst(result)).not.toThrow();
  });

  test("addServiceWorkerSupport patches the vite client", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = addServiceWorkerSupport(clientSource);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).not.toBe(clientSource);
    expect(result).toContain("chrome.runtime?.reload?.()");
    expect(result).not.toMatch(/(window\.)?location\.reload\(\)/);
    expect(() => parseAst(result)).not.toThrow();
  });

  test("both patches together produce parseable output", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = addServiceWorkerSupport(
      addCustomStyleFunctionality(clientSource)
    );

    expect(errorSpy).not.toHaveBeenCalled();
    expect(() => parseAst(result)).not.toThrow();
  });
});
