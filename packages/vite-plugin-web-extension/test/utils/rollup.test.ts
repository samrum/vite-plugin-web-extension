import { describe, it, expect } from "vitest";
import { addInputScriptsToOptionsInput } from "./../../src/utils/rollup";

describe("Rollup Utils", () => {
  describe("addInputScriptsToOptionsInput", () => {
    it("Adds input scripts to string input", () => {
      expect(
        addInputScriptsToOptionsInput(
          [["outputFile.js", "inputFile.js"]],
          "src/index.js"
        )
      ).toEqual({
        "src/index.js": "src/index.js",
        "outputFile.js": "inputFile.js",
      });
    });

    it("Adds input scripts to array input", () => {
      expect(
        addInputScriptsToOptionsInput(
          [["outputFile.js", "inputFile.js"]],
          ["src/index.js", "src/index2.js"]
        )
      ).toEqual({
        "src/index.js": "src/index.js",
        "src/index2.js": "src/index2.js",
        "outputFile.js": "inputFile.js",
      });
    });

    it("Adds input scripts to empty options input object", () => {
      expect(
        addInputScriptsToOptionsInput([["outputFile.js", "inputFile.js"]], {})
      ).toEqual({
        "outputFile.js": "inputFile.js",
      });
    });

    it("Adds input scripts to options input object with existing entries", () => {
      expect(
        addInputScriptsToOptionsInput([["outputFile2.js", "inputFile2.js"]], {
          "outputFile.js": "inputFile.js",
        })
      ).toEqual({
        "outputFile.js": "inputFile.js",
        "outputFile2.js": "inputFile2.js",
      });
    });
  });
});
