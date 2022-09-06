import { getExpectedCode } from "../shared/contentWithNoImports";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithNoImports";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
      matches: ["https://*/*", "http://*/*", "http://example.com/subpath/*"],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`assets/${resourceDir}/content.js`],
      matches: ["https://*/*", "http://*/*", "http://example.com/subpath/*"],
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
