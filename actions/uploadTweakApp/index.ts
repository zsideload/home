import type { AsyncFunctionArguments } from "@actions/github-script";
import { getIpaVersionFilePath } from "../lib/getIpaVersion.ts";
import { assetRepo, tweaks } from "../../info.ts";
import { basename } from "../lib/path.ts";
import * as fs from "node:fs";

export default async function ({ github, core }: AsyncFunctionArguments) {
  const tweakName = process.env.TWEAK_NAME;
  const filePath = process.env.FILE_PATH;
  if (!filePath || typeof filePath !== "string") {
    return core.setFailed("filePath invalid");
  }
  if (!tweakName || typeof tweakName !== "string" || !(tweakName in tweaks)) {
    return core.setFailed("tweakName invalid");
  }
  const tweakInfo = tweaks[tweakName as keyof typeof tweaks];

  // Get version number
  const appVersion = await getIpaVersionFilePath(filePath);
  const tweakVersion = await tweakInfo.workflow.getTweakVersion({
    builtFileName: basename(filePath),
  });

  // Upload
  const destinationReleaseId = (
    await github.rest.repos.getReleaseByTag({
      ...assetRepo,
      tag: `${tweakInfo.appName}_${appVersion}`,
    })
  ).data.id;
  await github.rest.repos.uploadReleaseAsset({
    ...assetRepo,
    release_id: destinationReleaseId,
    data: fs.readFileSync(filePath) as unknown as string,
    name: tweakInfo.workflow.optionalNotes
      ? `${tweakInfo.appName}_${appVersion}_${tweakName}_${tweakVersion}_${tweakInfo.workflow.optionalNotes}.ipa`
      : `${tweakInfo.appName}_${appVersion}_${tweakName}_${tweakVersion}.ipa`,
  });
}
