import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/options.js`]: getExpectedLog("options"),
  };

  const assetCode = {
    [`${resourceDir}/options.html`]: getExpectedHtml(`${resourceDir}/options`),
  };

  return {
    chunkCode,
    assetCode,
  };
}
