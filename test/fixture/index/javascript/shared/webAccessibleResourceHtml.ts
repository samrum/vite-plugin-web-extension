import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/webAccessibleResource.js`]: getExpectedLog(
      "webAccessibleResource"
    ),
  };

  const assetCode = {
    [`${resourceDir}/webAccessibleResource.html`]: getExpectedHtml(
      `${resourceDir}/webAccessibleResource`
    ),
  };

  return {
    chunkCode,
    assetCode,
  };
}
