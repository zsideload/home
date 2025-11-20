import { writeFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { apps, type tweaks } from "../../info.ts";
import { parseAssetName } from "../lib/releaseNames.ts";
import { aNewerThanB, sortDesc } from "../lib/compare.ts";
import { webBaseUrl, webBaseUrlWithBasicAuth } from "../lib/url.ts";
import { projectRoot } from "../lib/path.ts";
import type { parseReleases } from "./parseReleases.ts";
import type { SideloadRepoJson } from "./types.ts";

/**
 * `latest.json` = tweaked apps; latest versions
 */
export async function genereateLatestJson(
  tweakedAssets: Awaited<ReturnType<typeof parseReleases>>["tweakedAssets"],
) {
  const latestTweakedAppsMap = new Map<
    keyof typeof tweaks,
    SideloadRepoJson["apps"][number]
  >();
  for (const asset of tweakedAssets) {
    const { type, appName, appVersion, tweakName, tweakVersion } =
      parseAssetName(asset.name);
    if (type !== "tweaked") throw new Error("asset not tweaked");
    const appInfo = apps[appName];
    const current = latestTweakedAppsMap.get(tweakName);
    if (aNewerThanB(asset.name, current?.localizedDescription || "")) {
      latestTweakedAppsMap.set(tweakName, {
        name: tweakName,
        bundleIdentifier: appInfo.bundleIdentifier,
        version: `${appVersion}_${tweakVersion}`,
        localizedDescription: asset.name,
        downloadURL: `${webBaseUrlWithBasicAuth}/download/${asset.id}/${asset.name}`,
        iconURL: `${webBaseUrl}/icon/${appInfo.bundleIdentifier}.jpg`,
        versionDate: asset.created_at,
        size: asset.size,
      });
    }
  }
  const latestJson: SideloadRepoJson = {
    name: "zsideload latest",
    identifier: "zsideload.latest",
    iconURL: `${webBaseUrl}/icon.png`,
    apps: Array.from(latestTweakedAppsMap.values()).toSorted((a, b) =>
      sortDesc(a.versionDate, b.versionDate),
    ),
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/latest.json"),
    JSON.stringify(latestJson),
  );
  console.log("Wrote to generated/latest.json");
}
