import { getExpectedCss } from "../../../fixtureUtils";

export function getExpectedCode(resourceDir: string) {
  const chunkCode = {
    [`assets/${resourceDir}/content1.js`]: `/* empty css                               */const content1 = "";
console.log(["assets/content1.css","assets/contentShared.css"]);
`,
    [`assets/${resourceDir}/content2.js`]: `/* empty css                               */const content2 = "";
console.log(["assets/content2.css","assets/contentShared.css"]);
`,
    [`assets/${resourceDir}/contentNoCss.js`]: `console.log([]);
`,
  };

  const assetCode = {
    [`assets/content1.css`]: getExpectedCss("content1"),
    [`assets/content2.css`]: getExpectedCss("content2"),
    [`assets/contentShared.css`]: getExpectedCss("contentShared"),
  };

  return {
    chunkCode,
    assetCode,
  };
}
