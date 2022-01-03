export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/content.js`]: `console.log("content");\n`,
  };

  const assetCode = {};

  return {
    chunkCode,
    assetCode,
  };
}
