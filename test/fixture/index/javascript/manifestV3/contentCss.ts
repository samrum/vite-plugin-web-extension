import { getExpectedCode } from "../shared/contentCss";

const resourceDir = "test/fixture/index/javascript/resources/contentCss";

const inputManifest = {
  content_scripts: [
    {
      js: [`${resourceDir}/content.js`],
      css: [`${resourceDir}/content.css`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  content_scripts: [
    {
      js: [`assets/${resourceDir}/content.js`],
      css: [`${resourceDir}/content.css`],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
