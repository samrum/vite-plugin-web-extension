import type {
  InputOptions,
  OutputAsset,
  OutputBundle,
  OutputChunk,
} from "rollup";
import { ViteWebExtensionOptions } from "../../types";
import { getNormalizedFileName } from "./file";

export function addInputScriptsToOptionsInput(
  inputScripts: [string, string][],
  optionsInput: InputOptions["input"]
): { [entryAlias: string]: string } {
  const optionsInputObject = getOptionsInputAsObject(optionsInput);

  inputScripts.forEach(
    ([output, input]) => (optionsInputObject[output] = input)
  );

  return optionsInputObject;
}

function getOptionsInputAsObject(input: InputOptions["input"]): {
  [entryAlias: string]: string;
} {
  if (typeof input === "string") {
    if (!input.trim()) {
      return {};
    }

    return {
      [input]: input,
    };
  } else if (input instanceof Array) {
    if (!input.length) {
      return {};
    }

    const inputObject: { [entryAlias: string]: string } = {};

    input.forEach((input) => (inputObject[input] = input));

    return inputObject;
  }

  return input ?? {};
}

export function getChunkInfoFromBundle(
  bundle: OutputBundle,
  chunkId: string
): OutputChunk | undefined {
  const normalizedId = getNormalizedFileName(chunkId);

  return Object.values(bundle).find((chunk) => {
    if (chunk.type === "asset") {
      return false;
    }

    return (
      chunk.facadeModuleId?.endsWith(normalizedId) ||
      chunk.fileName.endsWith(normalizedId)
    );
  }) as OutputChunk | undefined;
}

function findMatchingOutputAsset(
  bundle: OutputBundle,
  normalizedInputId: string
): OutputAsset | undefined {
  return Object.values(bundle).find((chunk) => {
    if (chunk.type === "chunk") {
      return;
    }

    if (chunk.name) {
      return normalizedInputId.endsWith(chunk.name);
    }

    return chunk.fileName.endsWith(normalizedInputId);
  }) as OutputAsset | undefined;
}

export function getOutputInfoFromBundle(
  type: keyof NonNullable<ViteWebExtensionOptions["additionalInputs"]>,
  bundle: OutputBundle,
  inputId: string
): OutputAsset | OutputChunk | undefined {
  switch (type) {
    case "styles":
      return getCssAssetInfoFromBundle(bundle, inputId);
    case "scripts":
      return getChunkInfoFromBundle(bundle, inputId);
    case "html":
      return findMatchingOutputAsset(bundle, inputId);
    default:
      throw new Error(`Invalid additionalInput type of ${type}`);
  }
}

export function getCssAssetInfoFromBundle(
  bundle: OutputBundle,
  assetFileName: string
): OutputAsset | undefined {
  const normalizedInputId = getNormalizedFileName(assetFileName).replace(
    /\.[^/.]+$/,
    ".css"
  );

  return findMatchingOutputAsset(bundle, normalizedInputId);
}
