import { AdditionalInput, NormalizedAdditionalInput } from "../../types";

export default function getNormalizedAdditionalInput(
  input: AdditionalInput
): NormalizedAdditionalInput {
  const webAccessibleDefaults = {
    matches: ["<all_urls>"],
    includeEntryFile: false,
  };

  if (typeof input === "string") {
    return {
      fileName: input,
      webAccessible: webAccessibleDefaults,
    };
  }

  if (typeof input.webAccessible === "boolean") {
    return {
      ...input,
      webAccessible: input.webAccessible ? webAccessibleDefaults : null,
    };
  }

  return {
    ...input,
    webAccessible: {
      includeEntryFile: webAccessibleDefaults.includeEntryFile,
      ...input.webAccessible,
    },
  };
}
