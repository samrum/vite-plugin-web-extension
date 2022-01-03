import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/popup.js`]: getExpectedLog("popup"),
  };

  const assetCode = {
    [`${resourceDir}/popup.html`]: getExpectedHtml(`${resourceDir}/popup`),
  };

  return {
    chunkCode,
    assetCode,
  };
}
