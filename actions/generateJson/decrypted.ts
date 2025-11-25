import { writeFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { apps } from "../../info.ts";
import { parseAssetName } from "../lib/releaseNames.ts";
import { webBaseUrl, webBaseUrlWithBasicAuth } from "../lib/url.ts";
import { projectRoot } from "../lib/path.ts";
import type { parseReleases } from "./parseReleases.ts";
import type { SideloadRepoJson } from "./types.ts";
import { aNewerThanB, sortDesc } from "../lib/compare.ts";

/**
 * `decrypted.json` = decrypted apps; all versions
 * `decryptedlatest.json` = decrypted apps; latest versions
 */
export async function generateDecryptedJsons(
  decryptedAssets: Awaited<ReturnType<typeof parseReleases>>["decryptedAssets"],
) {
  const decryptedApps: SideloadRepoJson["apps"] = [];
  const latestdecryptedAppsMap = new Map<
    keyof typeof apps,
    SideloadRepoJson["apps"][number]
  >();

  for (const asset of decryptedAssets) {
    const { type, appName, appVersion } = parseAssetName(asset.name);
    if (type !== "decrypted") throw new Error("asset not tweaked");
    const appInfo = apps[appName];
    const appJson = {
      name: appName,
      bundleIdentifier: appInfo.bundleIdentifier,
      version: appVersion,
      localizedDescription: asset.name,
      downloadURL: `${webBaseUrlWithBasicAuth}/download/${asset.id}/${asset.name}`,
      iconURL: `${webBaseUrl}/icon/${appName}.jpg`,
      versionDate: asset.created_at,
      size: asset.size,
    };
    // all versions
    decryptedApps.push(appJson);
    // latest version
    const current = latestdecryptedAppsMap.get(appName);
    if (aNewerThanB(appVersion, current?.version || "")) {
      latestdecryptedAppsMap.set(appName, appJson);
    }
  }

  const decryptedJson: SideloadRepoJson = {
    name: "zsideload decrypted",
    identifier: "zsideload.decrypted",
    iconURL: `${webBaseUrl}/icon.png`,
    apps: decryptedApps.toSorted((a, b) =>
      sortDesc(a.versionDate, b.versionDate),
    ),
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/decrypted.json"),
    JSON.stringify(decryptedJson),
  );
  console.log("Wrote to generated/decrypted.json");

  const latestDecryptedJson: SideloadRepoJson = {
    name: "zsideload latest decrypted",
    identifier: "zsideload.decrypted.latest",
    iconURL: `${webBaseUrl}/icon.png`,
    apps: Array.from(latestdecryptedAppsMap.values()).toSorted((a, b) =>
      sortDesc(a.versionDate, b.versionDate),
    ),
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/decryptedlatest.json"),
    JSON.stringify(latestDecryptedJson),
  );
  console.log("Wrote to generated/decryptedlatest.json");
}
