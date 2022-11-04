import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleResourceHtml");

runManifestV2Test("webAccessibleResourceHtml", () => ({
  web_accessible_resources: [
    `${resourceDir}/webAccessibleResource.html`,
    `unhandled/*.html`,
    `*.html`,
  ],
}));
