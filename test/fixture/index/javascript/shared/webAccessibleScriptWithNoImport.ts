import { getExpectedScriptLoaderHtml } from "../../../fixtureUtils";
export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/webAccessibleScript.js`]: `console.log("webAccessibleScript");\n`,
  };

  const assetCode = {
    [`${resourceDir}/webAccessibleScript.js`]: getExpectedScriptLoaderHtml(
      `assets/${resourceDir}/webAccessibleScript.js`
    ),
  };

  return {
    chunkCode,
    assetCode,
  };
}
