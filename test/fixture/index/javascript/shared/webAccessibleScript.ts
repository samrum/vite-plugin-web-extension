import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/webAccessibleScript.js`]: getExpectedLog(
      "webAccessibleScript"
    ),
  };

  const assetCode = {};

  return {
    chunkCode,
    assetCode,
  };
}
