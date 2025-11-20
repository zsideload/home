import type { AsyncFunctionArguments } from "@actions/github-script";
import { parseReleases } from "./parseReleases.ts";
import { generateDecryptedJsons } from "./decrypted.ts";
import { genereateTweakedJsons } from "./tweaked.ts";

export default async function ({ github }: AsyncFunctionArguments) {
  const { decryptedAssets, tweakedAssets } = await parseReleases({ github });
  await generateDecryptedJsons(decryptedAssets);
  await genereateTweakedJsons(tweakedAssets);
}
