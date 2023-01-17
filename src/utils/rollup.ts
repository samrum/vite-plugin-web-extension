import type {
  InputOptions,
  OutputAsset,
  OutputBundle,
  OutputChunk,
} from "rollup";
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

export function getCssAssetInfoFromBundle(
  bundle: OutputBundle,
  assetFileName: string
): OutputAsset | undefined {
  const normalizedFileName = getNormalizedFileName(assetFileName).replace(
    /\.[^/.]+$/,
    ".css"
  );

  return Object.values(bundle).find((chunk) => {
    if (chunk.type === "chunk") {
      return;
    }

    return normalizedFileName.endsWith(chunk.name ?? chunk.fileName);
  }) as OutputAsset | undefined;
}
