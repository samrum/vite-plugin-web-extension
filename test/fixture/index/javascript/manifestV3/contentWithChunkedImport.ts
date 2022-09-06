import { getExpectedCode } from "../shared/contentWithChunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithChunkedImport";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/subpath/*",
        "https://example.com/subpath/*",
      ],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/subpath/*",
        "https://example.com/subpath/*",
      ],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/subpath/*",
        "https://example.com/subpath/*",
      ],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/subpath/*",
        "https://example.com/subpath/*",
      ],
    },
  ],
  web_accessible_resources: [
    {
      resources: [`assets/${resourceDir}/content1.js`, "assets/log.js"],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/*",
        "https://example.com/*",
      ],
      use_dynamic_url: true,
    },
    {
      resources: [`assets/${resourceDir}/content2.js`, "assets/log.js"],
      matches: [
        "*://*/*",
        "https://*/*",
        "*://example.com/",
        "https://example.com/",
        "*://example.com/*",
        "https://example.com/*",
      ],
      use_dynamic_url: true,
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
