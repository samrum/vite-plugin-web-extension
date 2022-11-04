import { getResourceDir, runManifestV2Test } from "./manifestTestUtils";

const resourceDir = getResourceDir("fullExtension");

runManifestV2Test("fullExtension", () => ({
  background: {
    scripts: [`${resourceDir}/src/entries/background/main.js`],
    persistent: false,
  },
  content_scripts: [
    {
      js: [`${resourceDir}/src/entries/contentScript/primary/main.js`],
      matches: ["*://*/*"],
    },
  ],
  web_accessible_resources: [`${resourceDir}/src/lib.js`],
  browser_action: {
    default_icon: {
      32: `${resourceDir}/src/assets/logo.svg`,
    },
    // default_popup: `${resourceDir}/src/entries/popup/index.html`,
  },
  options_ui: {
    chrome_style: false,
    open_in_tab: true,
    page: `${resourceDir}/src/entries/options/index.html`,
  },
  permissions: ["*://*/*"],
}));
