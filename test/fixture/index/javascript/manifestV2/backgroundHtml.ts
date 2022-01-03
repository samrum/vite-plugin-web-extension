import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";

const resourceDir = "test/fixture/index/javascript/resources/backgroundHtml";

const inputManifest = {
  background: {
    page: `${resourceDir}/background.html`,
    persistent: false,
  },
};

const expectedManifest = {
  background: {
    page: `${resourceDir}/background.html`,
    persistent: false,
  },
};

const chunkCode = {
  [`assets/${resourceDir}/background.js`]: getExpectedLog("background"),
};

const assetCode = {
  [`${resourceDir}/background.html`]: getExpectedHtml(
    `${resourceDir}/background`
  ),
};

export default {
  inputManifest,
  expectedManifest,
  chunkCode,
  assetCode,
};
