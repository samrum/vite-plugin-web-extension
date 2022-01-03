import { getExpectedHtmlLoader, getExpectedLog } from "../../../fixtureUtils";

const resourceDir = "test/fixture/index/javascript/resources/backgroundScript";

const inputManifest = {
  background: {
    scripts: [`/${resourceDir}/background.js`],
    persistent: false,
  },
};

const expectedManifest = {
  background: {
    persistent: false,
    page: `background.html`,
  },
};

const chunkCode = {
  [`assets/background.js`]: getExpectedLog("background"),
};

const assetCode = {
  [`background.html`]: getExpectedHtmlLoader("background"),
};

export default {
  inputManifest,
  expectedManifest,
  chunkCode,
  assetCode,
};
