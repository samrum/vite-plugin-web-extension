import {
  getExpectedContentLoaderHtml,
  getExpectedLog,
} from "../../../fixtureUtils";
export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/webAccessibleScript.js`]: getExpectedLog(
      "webAccessibleScript"
    ),
  };

  const assetCode = {
    [`${resourceDir}/webAccessibleScript.js`]: getExpectedContentLoaderHtml(
      `assets/${resourceDir}/webAccessibleScript.js`
    ),
  };

  return {
    chunkCode,
    assetCode,
  };
}
