import { getExpectedLog } from "../../../fixtureUtils";
import { getExpectedCode } from "../shared/contentWithUnchunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithUnchunkedImport";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`assets/${resourceDir}/content.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
