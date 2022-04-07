import { getExpectedCss } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/content1.js`]: `/* empty css                               */var content1 = "";
console.log(["assets/test/fixture/index/javascript/resources/chunkCssRewrite/content1.css","assets/contentShared.css"]);
`,
    [`assets/${resourceDir}/content2.js`]: `/* empty css                               */var content2 = "";
console.log(["assets/test/fixture/index/javascript/resources/chunkCssRewrite/content2.css","assets/contentShared.css"]);
`,
    [`assets/${resourceDir}/contentNoCss.js`]: `console.log([]);
`,
  };

  const assetCode = {
    [`assets/${resourceDir}/content1.css`]: getExpectedCss("content1"),
    [`assets/${resourceDir}/content2.css`]: getExpectedCss("content2"),
    [`assets/contentShared.css`]: getExpectedCss("contentShared"),
  };

  return {
    chunkCode,
    assetCode,
  };
}
