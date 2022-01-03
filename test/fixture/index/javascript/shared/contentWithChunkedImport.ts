import {
  getExpectedContentLoaderHtml,
  getExpectedLogChunk,
  getExpectedLogFromChunk,
} from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/content1.js`]: getExpectedLogFromChunk("content"),
    [`assets/${resourceDir}/content2.js`]: getExpectedLogFromChunk("content2"),
    ["assets/log.js"]: getExpectedLogChunk(),
  };

  const assetCode = {
    [`${resourceDir}/content1.js`]: getExpectedContentLoaderHtml(
      `assets/${resourceDir}/content1.js`
    ),
    [`${resourceDir}/content2.js`]: getExpectedContentLoaderHtml(
      `assets/${resourceDir}/content2.js`
    ),
  };

  return {
    chunkCode,
    assetCode,
  };
}
