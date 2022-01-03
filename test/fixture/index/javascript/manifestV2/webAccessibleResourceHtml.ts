import { getExpectedHtml, getExpectedLog } from "../../../fixtureUtils";
import { getExpectedCode } from "../shared/webAccessibleResourceHtml";

const resourceDir =
  "test/fixture/index/javascript/resources/webAccessibleResourceHtml";

const inputManifest = {
  web_accessible_resources: [
    `${resourceDir}/webAccessibleResource.html`,
    `unhandled/*.html`,
    `*.html`,
  ],
};

const expectedManifest = {
  web_accessible_resources: [
    `${resourceDir}/webAccessibleResource.html`,
    `unhandled/*.html`,
    `*.html`,
  ],
};

export default {
  inputManifest,
  expectedManifest,
  ...getExpectedCode(resourceDir),
};
