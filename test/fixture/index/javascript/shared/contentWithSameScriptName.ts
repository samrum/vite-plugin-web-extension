export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/content1/content.js`]: `console.log("content1");\n`,
    [`assets/${resourceDir}/content2/content.js`]: `console.log("content2");\n`,
  };

  const assetCode = {};

  return {
    chunkCode,
    assetCode,
  };
}
