import { octokit } from "@/scripts/lib/github";
import { assetRepo } from "@/scripts/lib/info";
import { parseAssetName } from "@/scripts/lib/releases";

export const parseReleases = async (
  { limit }: { limit: number | null } = { limit: null },
) => {
  const decryptedAssets = [];
  const tweakedAssets = [];

  const releasesIterator = octokit.paginate.iterator(
    octokit.rest.repos.listReleases,
    {
      ...assetRepo,
      per_page: 100,
    },
  );

  let releaseLoopCount = 0;
  outerLoop: for await (const { data: pageOfReleases } of releasesIterator) {
    for (const release of pageOfReleases) {
      if (limit !== null && releaseLoopCount >= limit) {
        break outerLoop;
      }
      releaseLoopCount++;
      // each release
      for (const asset of release.assets) {
        // each asset
        const assetInfo = parseAssetName(asset.name);
        if (assetInfo.type === "decrypted") {
          decryptedAssets.push(asset);
        } else if (assetInfo.type === "tweaked") {
          tweakedAssets.push(asset);
        }
      }
    }
  }

  return { decryptedAssets, tweakedAssets };
};
