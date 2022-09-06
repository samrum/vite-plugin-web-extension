import { getExpectedCode } from "../shared/contentWithSameScriptName";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithSameScriptName";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1/content.js`],
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
      js: [`${resourceDir}/content2/content.js`],
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
      js: [`assets/${resourceDir}/content1/content.js`],
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
      js: [`assets/${resourceDir}/content2/content.js`],
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

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
