import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/chromeUrlOverridesHtml.js`]: getExpectedLog(
      "chromeUrlOverridesHtml"
    ),
  };

  const assetCode = {
    [`${resourceDir}/newtab.html`]: getExpectedHtml(`chromeUrlOverridesHtml`),
    [`${resourceDir}/history.html`]: getExpectedHtml(`chromeUrlOverridesHtml`),
    [`${resourceDir}/bookmarks.html`]: getExpectedHtml(
      `chromeUrlOverridesHtml`
    ),
  };

  return {
    chunkCode,
    assetCode,
  };
}
