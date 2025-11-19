import type { AsyncFunctionArguments } from "@actions/github-script";
import { getIpaVersion } from "../lib/getIpaVersion.ts";
import { assetRepo, tweaks } from "../../info.ts";

export default async function ({
  github,
  context,
  core,
}: AsyncFunctionArguments) {
  const tweakName = context.payload.inputs.tweakName;
  if (typeof tweakName === "string" && tweakName in tweaks) {
    const tweakInfo = tweaks[tweakName as keyof typeof tweaks];

    // Download latest
    const buildRepoReleases = await github.rest.repos.listReleases({
      owner: tweakInfo.actionRepo.owner,
      repo: tweakInfo.actionRepo.repo,
    });
    const latestRelease = buildRepoReleases.data[0];
    const latestAsset = latestRelease.assets.toSorted(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
    const latestAssetFile = (
      await github.rest.repos.getReleaseAsset({
        owner: tweakInfo.actionRepo.owner,
        repo: tweakInfo.actionRepo.repo,
        asset_id: latestAsset.id,
        headers: {
          accept: "application/octet-stream",
        },
      })
    ).data as unknown as ArrayBuffer;

    // Get version number
    const appVersion = await getIpaVersion(latestAssetFile);
    const tweakVersion = await tweakInfo.workflow.getTweakVersion({
      builtFileName: latestAsset.name,
      head_sha: process.env.HEAD_SHA,
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
      data: latestAssetFile as unknown as string,
      name: tweakInfo.workflow.optionalNotes
        ? `${tweakInfo.appName}_${appVersion}_${tweakName}_${tweakVersion}_${tweakInfo.workflow.optionalNotes}.ipa`
        : `${tweakInfo.appName}_${appVersion}_${tweakName}_${tweakVersion}.ipa`,
    });
  } else {
    return core.setFailed("5-download-and-upload failed");
  }
}
