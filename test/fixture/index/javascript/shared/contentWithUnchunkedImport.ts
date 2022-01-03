import { getExpectedLog } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/content.js`]: getExpectedLog("content"),
  };

  const assetCode = {};

  return {
    chunkCode,
    assetCode,
  };
}
