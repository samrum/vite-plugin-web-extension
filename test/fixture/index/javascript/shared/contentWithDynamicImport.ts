import {
  getExpectedContentLoaderHtml,
  getExpectedLogDynamicChunk,
  getExpectedLogFromDynamicChunk,
  getPreloadHelper,
} from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/preload-helper.js`]: getPreloadHelper(),
    [`assets/${resourceDir}/content1.js`]:
      getExpectedLogFromDynamicChunk("content"),
    [`assets/${resourceDir}/content2.js`]:
      getExpectedLogFromDynamicChunk("content2"),
    ["assets/log.js"]: getExpectedLogDynamicChunk(),
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
