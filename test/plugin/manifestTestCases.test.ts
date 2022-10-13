import { describe } from "vitest";
import { runManifestV2Tests, runManifestV3Tests } from "./manifestTestUtils";
import * as MANIFEST_V2_TEST_CASES from "./manifestV2TestCases";
import * as MANIFEST_V3_TEST_CASES from "./manifestV3TestCases";

describe("Vite Plugin Web Extension", () => {
  describe("Manifest V2", () => {
    runManifestV2Tests(MANIFEST_V2_TEST_CASES);
  });

  describe("Manifest V3", () => {
    runManifestV3Tests(MANIFEST_V3_TEST_CASES);
  });
});
