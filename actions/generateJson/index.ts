import type { AsyncFunctionArguments } from "@actions/github-script";
import { parseReleases } from "./parseReleases.ts";
import { generateDecryptedJson } from "./decrypted.ts";
import { genereateLatestJson } from "./latest.ts";

export default async function ({ github }: AsyncFunctionArguments) {
  const { decryptedAssets, tweakedAssets } = await parseReleases({ github });
  await generateDecryptedJson(decryptedAssets);
  await genereateLatestJson(tweakedAssets);
}
