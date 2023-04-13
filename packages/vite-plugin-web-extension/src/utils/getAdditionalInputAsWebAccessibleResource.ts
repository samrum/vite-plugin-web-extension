import { NormalizedAdditionalInput } from "../../types";

export default function getAdditionalInputAsWebAccessibleResource(
  input: NormalizedAdditionalInput
): {
  matches: string[] | undefined;
  extension_ids: string[] | undefined;
  use_dynamic_url?: boolean;
} | null {
  if (!input.webAccessible) {
    return null;
  }

  return {
    matches: input.webAccessible.matches,
    extension_ids: input.webAccessible.extensionIds,
    use_dynamic_url: true,
  };
}
