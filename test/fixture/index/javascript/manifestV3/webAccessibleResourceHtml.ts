import { getExpectedCode } from "../shared/webAccessibleResourceHtml";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleResourceHtml";

const inputManifest = {
  web_accessible_resources: [
    {
      resources: [
        `${resourceDir}/webAccessibleResource.html`,
        `unhandled/*.html`,
        `*.html`,
      ],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

const expectedManifest = {
  web_accessible_resources: [
    {
      resources: [
        `${resourceDir}/webAccessibleResource.html`,
        `unhandled/*.html`,
        `*.html`,
      ],
      matches: ["https://*/*", "http://*/*"],
    },
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
