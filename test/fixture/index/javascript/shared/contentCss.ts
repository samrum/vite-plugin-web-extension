export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/content.js`]: `console.log("content");\n`,
  };

  const assetCode = {
    [`${resourceDir}/content.css`]: `.css {
}\n`,
  };

  return {
    chunkCode,
    assetCode,
  };
}
