import { getResourceDir, runManifestV3Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("fullExtension");

runManifestV3Test("fullExtension", () => ({
  action: {
    default_icon: {
      32: `${resourceDir}/src/assets/logo.svg`,
    },
    // default_popup: `${resourceDir}/src/entries/popup/index.html`,
  },
  background: {
    service_worker: `${resourceDir}/src/entries/background/main.js`,
  },
  content_scripts: [
    {
      js: [`${resourceDir}/src/entries/contentScript/primary/main.js`],
      matches: ["*://*/*"],
    },
  ],
  host_permissions: ["*://*/*"],
  permissions: ["scripting", "tabs"],
  icons: {
    512: `${resourceDir}/src/assets/logo.svg`,
  },
  options_ui: {
    page: `${resourceDir}/src/entries/options/index.html`,
    open_in_tab: true,
  },
  web_accessible_resources: [
    {
      matches: ["<all_urls>"],
      resources: [`${resourceDir}/src/lib.js`],
    },
  ],
}));
