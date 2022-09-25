import { getExpectedCode } from "../shared/fullIntegration";

const resourceDir = "test/fixture/index/javascript/resources/fullIntegration";

const inputManifest = {
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
};

const expectedManifest = {
  background: {
    persistent: false,
    page: "background.html",
  },
  content_scripts: [
    {
      js: [
        "test/fixture/index/javascript/resources/fullIntegration/src/entries/contentScript/primary/main.js",
      ],
      matches: ["*://*/*"],
    },
  ],
  web_accessible_resources: [
    "test/fixture/index/javascript/resources/fullIntegration/src/lib.js",
    "assets/test/fixture/index/javascript/resources/fullIntegration/src/lib.js",
    "assets/test/fixture/index/javascript/resources/fullIntegration/src/entries/contentScript/primary/main.js",
    "assets/logo.js",
    "assets/logo.svg",
    "assets/main.css",
  ],
  browser_action: {
    default_icon: {
      "32": "test/fixture/index/javascript/resources/fullIntegration/src/assets/logo.svg",
    },
  },
  options_ui: {
    chrome_style: false,
    open_in_tab: true,
    page: "test/fixture/index/javascript/resources/fullIntegration/src/entries/options/index.html",
  },
  permissions: ["*://*/*"],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir, 2),
};
