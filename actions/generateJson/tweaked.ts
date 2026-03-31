import { writeFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { apps, type tweaks } from "../../info.ts";
import { parseAssetName } from "../lib/releaseNames.ts";
import { aNewerThanB, sortDesc } from "../lib/compare.ts";
import { webBaseUrl, webBaseUrlWithBasicAuth } from "../lib/url.ts";
import { projectRoot } from "../lib/path.ts";
import type { parseReleases } from "./parseReleases.ts";
import type { SideloadRepoJson } from "./types.ts";

const formatter = new Intl.DateTimeFormat("en-TH", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/**
 * `tweaked.json` = tweaked apps; all versions
 * `tweakedlatest.json` = tweaked apps; latest versions
 */
export async function genereateTweakedJsons(
  tweakedAssets: Awaited<ReturnType<typeof parseReleases>>["tweakedAssets"],
) {
  const tweakedApps: SideloadRepoJson["apps"] = [];
  const latestTweakedAppsMap = new Map<
    keyof typeof tweaks,
    SideloadRepoJson["apps"][number]
  >();
  for (const asset of tweakedAssets) {
    const { type, appName, appVersion, tweakName, tweakVersion } =
      parseAssetName(asset.name);
    if (type !== "tweaked") throw new Error("asset not tweaked");
    const appInfo = apps[appName];
    const appJson = {
      name: tweakName,
      bundleIdentifier: appInfo.bundleIdentifier,
      version: `${appVersion}_${tweakVersion}`,
      localizedDescription: `${asset.name}\n${
        asset.created_at ? formatter.format(new Date(asset.created_at)) : ""
      }`,
      downloadURL: `${webBaseUrlWithBasicAuth}/download/${asset.id}/${asset.name}`,
      iconURL: `${webBaseUrl}/icon/${appName}.jpg`,
      versionDate: asset.created_at,
      size: asset.size,
      developerName: "",
    };
    // all versions
    tweakedApps.push(appJson);
    // latest version
    const current = latestTweakedAppsMap.get(tweakName);
    if (!current || aNewerThanB(asset.name, current.localizedDescription)) {
      latestTweakedAppsMap.set(tweakName, appJson);
    }
  }

  const tweakedJson: SideloadRepoJson = {
    name: "zsideload tweaked",
    identifier: "zsideload.tweaked",
    iconURL: `${webBaseUrl}/icon.png`,
    apps: tweakedApps.toSorted((a, b) =>
      sortDesc(a.versionDate, b.versionDate),
    ),
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/tweaked.json"),
    JSON.stringify(tweakedJson),
  );
  console.log("Wrote to generated/tweaked.json");

  const latestTweakedJson: SideloadRepoJson = {
    name: "zsideload latest tweaked",
    identifier: "zsideload.tweaked.latest",
    iconURL: `${webBaseUrl}/icon.png`,
    apps: Array.from(latestTweakedAppsMap.values()).toSorted((a, b) =>
      sortDesc(a.versionDate, b.versionDate),
    ),
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/tweakedlatest.json"),
    JSON.stringify(latestTweakedJson),
  );
  console.log("Wrote to generated/tweakedlatest.json");
}
