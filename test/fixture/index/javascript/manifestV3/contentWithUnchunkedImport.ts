import { getExpectedLog } from "../../../fixtureUtils";
import { getExpectedCode } from "../shared/contentWithUnchunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithUnchunkedImport";

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

const chunkCode = {
  [`assets/content.js`]: getExpectedLog("content"),
};

const assetCode = {};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
