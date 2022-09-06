import { getExpectedCode } from "../shared/chromeUrlOverridesHtml";

const resourceDir =
  "test/fixture/index/javascript/resources/chromeUrlOverridesHtml";

// NOTE: Currently, an extension may only define one of these in its manifest
const inputManifest = {
  chrome_url_overrides: {
    newtab: `${resourceDir}/newtab.html`,
    history: `${resourceDir}/history.html`,
    bookmarks: `${resourceDir}/bookmarks.html`,
  },
};

const expectedManifest = {
  chrome_url_overrides: {
    newtab: `${resourceDir}/newtab.html`,
    history: `${resourceDir}/history.html`,
    bookmarks: `${resourceDir}/bookmarks.html`,
  },
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
