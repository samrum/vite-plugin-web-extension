import { getExpectedCode } from "../shared/fullIntegration";

const resourceDir = "test/fixture/index/javascript/resources/fullIntegration";

const inputManifest = {
  action: {
    default_icon: {
      32: `${resourceDir}/src/assets/logo.svg`,
    },
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
};

const expectedManifest = {
  action: {
    default_icon: {
      "32": "test/fixture/index/javascript/resources/fullIntegration/src/assets/logo.svg",
    },
  },
  background: {
    service_worker: "serviceWorker.js",
    type: "module",
  },
  content_scripts: [
    {
      js: [
        "test/fixture/index/javascript/resources/fullIntegration/src/entries/contentScript/primary/main.js",
      ],
      matches: ["*://*/*"],
    },
  ],
  host_permissions: ["*://*/*"],
  permissions: ["scripting", "tabs"],
  icons: {
    "512":
      "test/fixture/index/javascript/resources/fullIntegration/src/assets/logo.svg",
  },
  options_ui: {
    page: "test/fixture/index/javascript/resources/fullIntegration/src/entries/options/index.html",
    open_in_tab: true,
  },
  web_accessible_resources: [
    {
      matches: ["<all_urls>"],
      resources: [
        "test/fixture/index/javascript/resources/fullIntegration/src/lib.js",
        "assets/test/fixture/index/javascript/resources/fullIntegration/src/lib.js",
      ],
    },
    {
      resources: [
        "assets/test/fixture/index/javascript/resources/fullIntegration/src/entries/contentScript/primary/main.js",
        "assets/logo.js",
        "assets/logo.svg",
        "assets/main.css",
      ],
      matches: ["*://*/*"],
      use_dynamic_url: true,
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir, 3),
};
