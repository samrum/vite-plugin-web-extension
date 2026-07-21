import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { createServer, parseAst } from "vite";
import type { Connect } from "vite";
import { beforeAll, describe, expect, test } from "vitest";
import devClientMiddleware, {
  getServiceWorkerClientSource,
  getViteClientWrapperSource,
  ORIGINAL_VITE_CLIENT_URL,
  SERVICE_WORKER_CLIENT_URL,
  VITE_CLIENT_URL,
} from "../../src/middleware/devClient";

interface MiddlewareResult {
  nextCalled: boolean;
  reqUrl: string | undefined;
  statusCode: number;
  headers: Record<string, unknown>;
  body: string | undefined;
}

function invokeMiddleware(
  url: string,
  headers: Record<string, string> = {}
): Promise<MiddlewareResult> {
  return new Promise((resolve) => {
    const req = { url, headers } as Connect.IncomingMessage;

    const responseHeaders: Record<string, unknown> = {};
    const res = {
      statusCode: 200,
      setHeader(name: string, value: unknown) {
        responseHeaders[name.toLowerCase()] = value;
      },
      end(body?: string) {
        resolve({
          nextCalled: false,
          reqUrl: req.url,
          statusCode: res.statusCode,
          headers: responseHeaders,
          body,
        });
      },
    };

    devClientMiddleware(req, res as never, () => {
      resolve({
        nextCalled: true,
        reqUrl: req.url,
        statusCode: res.statusCode,
        headers: responseHeaders,
        body: undefined,
      });
    });
  });
}

// These tests pin the vite contracts the dev client modules depend on so a
//   vite update that breaks them fails CI instead of silently disabling web
//   extension HMR support
describe("vite client contract", () => {
  let viteClientSource: string;

  beforeAll(async () => {
    const vitePackageJsonPath = createRequire(import.meta.url).resolve(
      "vite/package.json"
    );

    viteClientSource = await readFile(
      path.join(path.dirname(vitePackageJsonPath), "dist/client/client.mjs"),
      { encoding: "utf-8" }
    );
  });

  test("vite client exports the functions the wrapper delegates to", () => {
    const exportStatements = viteClientSource.match(/export \{[^}]*\}/g) ?? [];
    const exportedNames = exportStatements.join(" ");

    expect(exportedNames).toContain("updateStyle");
    expect(exportedNames).toContain("removeStyle");
    expect(exportedNames).toContain("createHotContext");
  });

  test("dev css modules import style functions from /@vite/client", async () => {
    const server = await createServer({
      root: path.resolve(__dirname, "../.."),
      configFile: false,
      logLevel: "silent",
      server: { middlewareMode: true },
    });

    try {
      const result = await server.environments.client.transformRequest(
        "/test/manifest/resources/contentCss/content1.css"
      );

      expect(result?.code).toContain(`from "${VITE_CLIENT_URL}"`);
      expect(result?.code).toContain("updateStyle");
      expect(result?.code).toContain("removeStyle");
    } finally {
      await server.close();
    }
  });
});

describe("dev client module sources", () => {
  test("vite client wrapper parses and re-exports the original client", () => {
    const source = getViteClientWrapperSource();

    expect(() => parseAst(source)).not.toThrow();
    expect(source).toContain(`export * from "${ORIGINAL_VITE_CLIENT_URL}"`);
    expect(source).toContain("export function addStyleTarget");
    expect(source).toContain("export function updateStyle");
    expect(source).toContain("export function removeStyle");
  });

  test("service worker client parses and reloads the extension", () => {
    const source = getServiceWorkerClientSource();

    expect(() => parseAst(source)).not.toThrow();
    expect(source).toContain(`from "${ORIGINAL_VITE_CLIENT_URL}"`);
    expect(source).toContain("vite:beforeFullReload");
    expect(source).toContain("vite:ws:disconnect");
    expect(source).toContain("chrome.runtime?.reload?.()");
  });
});

describe("devClientMiddleware", () => {
  test("serves the wrapper at the vite client url", async () => {
    const result = await invokeMiddleware(VITE_CLIENT_URL);

    expect(result.nextCalled).toBe(false);
    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("text/javascript");
    expect(result.body).toContain("addStyleTarget");
  });

  test("serves the service worker client", async () => {
    const result = await invokeMiddleware(SERVICE_WORKER_CLIENT_URL);

    expect(result.nextCalled).toBe(false);
    expect(result.body).toContain("vite:beforeFullReload");
  });

  test("responds 304 when the etag matches", async () => {
    const first = await invokeMiddleware(VITE_CLIENT_URL);

    const second = await invokeMiddleware(VITE_CLIENT_URL, {
      "if-none-match": first.headers["etag"] as string,
    });

    expect(second.statusCode).toBe(304);
    expect(second.body).toBeUndefined();
  });

  test("rewrites the original client url to the vite client url", async () => {
    const result = await invokeMiddleware(ORIGINAL_VITE_CLIENT_URL);

    expect(result.nextCalled).toBe(true);
    expect(result.reqUrl).toBe(VITE_CLIENT_URL);
  });

  test("passes other requests through untouched", async () => {
    const result = await invokeMiddleware("/src/main.ts");

    expect(result.nextCalled).toBe(true);
    expect(result.reqUrl).toBe("/src/main.ts");
  });
});
