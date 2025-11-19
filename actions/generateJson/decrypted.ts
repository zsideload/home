import { writeFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { apps } from "../../info.ts";
import { parseAssetName } from "../lib/releaseNames.ts";
import { webBaseUrl, webBaseUrlWithBasicAuth } from "../lib/url.ts";
import { projectRoot } from "../lib/path.ts";
import type { parseReleases } from "./parseReleases.ts";
import type { SideloadRepoJson } from "./types.ts";

/**
 * `decrypted.json` = decrypted apps; all versions
 */
export async function generateDecryptedJson(
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
      downloadURL: `${webBaseUrlWithBasicAuth}/download/${asset.id}/${asset.name}`,
      iconURL: `${webBaseUrl}/icon/${appInfo.bundleIdentifier}.jpg`,
      versionDate: asset.created_at,
      size: asset.size,
    });
  }
  const decryptedJson: SideloadRepoJson = {
    name: "zsideload decrypted",
    identifier: "zsideload.decrypted",
    iconURL: `${webBaseUrl}/icon.png`,
    apps: decryptedApps,
  };
  await writeFile(
    pathJoin(projectRoot, "./generated/decrypted.json"),
    JSON.stringify(decryptedJson),
  );
  console.log("Wrote to generated/decrypted.json");
}
