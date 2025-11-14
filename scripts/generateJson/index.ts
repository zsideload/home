import { writeFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { aNewerThanB } from "@/scripts/lib/compare";
import { apps, type tweaks } from "@/scripts/lib/info";
import { projectRoot } from "@/scripts/lib/path";
import { parseAssetName } from "@/scripts/lib/releases";
import { parseReleases } from "./parseReleases";
import type { SideloadRepoJson } from "./types";

/**
 * `decrypted.json` = decrypted apps; all versions
 */
async function generateDecryptedJson(
  decryptedAssets: Awaited<ReturnType<typeof parseReleases>>["decryptedAssets"],
) {
  const decryptedApps: SideloadRepoJson["apps"] = [];
  for (const asset of decryptedAssets) {
    const { appName, appVersion } = parseAssetName(asset.name);
    const appInfo = apps[appName];
    decryptedApps.push({
      name: appName,
      bundleIdentifier: appInfo.bundleIdentifier,
      version: appVersion,
      localizedDescription: asset.name,
      downloadURL: "",
      iconURL: "",
      versionDate: asset.created_at,
      size: asset.size,
    });
  }
  const decryptedJson: SideloadRepoJson = {
    name: "zsideload decrypted",
    identifier: "zsideload.decrypted",
    iconURL: "",
    apps: decryptedApps,
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/decrypted.json"),
    JSON.stringify(decryptedJson),
  );
  console.log("Wrote to ./generated/decrypted.json");
}

/**
 * `latest.json` = tweaked apps; latest versions
 */
async function genereateLatestJson(
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
        downloadURL: "",
        iconURL: "",
        versionDate: asset.created_at,
        size: asset.size,
      });
    }
  }
  const latestJson: SideloadRepoJson = {
    name: "zsideload latest",
    identifier: "zsideload.latest",
    iconURL: "",
    apps: Array.from(latestTweakedAppsMap.values()),
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/latest.json"),
    JSON.stringify(latestJson),
  );
  console.log("Wrote to ./generated/latest.json");
}

const { decryptedAssets, tweakedAssets } = await parseReleases();
await generateDecryptedJson(decryptedAssets);
await genereateLatestJson(tweakedAssets);
