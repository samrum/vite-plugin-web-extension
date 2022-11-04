import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("webAccessibleResourceHtml");

runManifestV3Test("webAccessibleResourceHtml", () => ({
  web_accessible_resources: [
    {
      resources: [
        `${resourceDir}/webAccessibleResource.html`,
        `unhandled/*.html`,
        `*.html`,
      ],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
}));
