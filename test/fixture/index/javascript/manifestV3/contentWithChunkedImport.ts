import {
  getExpectedContentLoaderHtml,
  getExpectedLogChunk,
  getExpectedLogFromChunk,
} from "../../../fixtureUtils";
import { getExpectedCode } from "../shared/contentWithChunkedImport";

const resourceDir =
  "test/fixture/index/javascript/resources/contentWithChunkedImport";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content1.js`],
      matches: ["https://*/*", "http://*/*"],
    },
    {
      js: [`${resourceDir}/content2.js`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [`assets/${resourceDir}/content1.js`, "assets/log.js"],
      matches: ["https://*/*", "http://*/*"],
      use_dynamic_url: true,
    },
    {
      resources: [`assets/${resourceDir}/content2.js`, "assets/log.js"],
      matches: ["https://*/*", "http://*/*"],
      use_dynamic_url: true,
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
