import {
  getExpectedContentLoaderHtml,
  getExpectedLogChunk,
  getExpectedLogFromChunk,
} from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/webAccessibleScript1.js`]: getExpectedLogFromChunk(
      "webAccessibleScript1"
    ),
    [`assets/${resourceDir}/webAccessibleScript2.js`]: getExpectedLogFromChunk(
      "webAccessibleScript2"
    ),
    ["assets/log.js"]: getExpectedLogChunk(),
  };

  const assetCode = {
    [`${resourceDir}/webAccessibleScript1.js`]: getExpectedContentLoaderHtml(
      `assets/${resourceDir}/webAccessibleScript1.js`
    ),
    [`${resourceDir}/webAccessibleScript2.js`]: getExpectedContentLoaderHtml(
      `assets/${resourceDir}/webAccessibleScript2.js`
    ),
  };

  return {
    chunkCode,
    assetCode,
  };
}
