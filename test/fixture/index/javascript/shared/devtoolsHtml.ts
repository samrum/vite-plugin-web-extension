import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/devtools.js`]: getExpectedLog("devtools"),
  };

  const assetCode = {
    [`${resourceDir}/devtools.html`]: getExpectedHtml(
      `${resourceDir}/devtools`
    ),
  };

  return {
    chunkCode,
    assetCode,
  };
}
