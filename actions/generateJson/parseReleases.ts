import type { AsyncFunctionArguments } from "@actions/github-script";
import { assetRepo } from "../../info.ts";
import { parseAssetName } from "../lib/releaseNames.ts";

export const parseReleases = async ({
  limit = null,
  github,
}: {
  limit?: number | null;
  github: AsyncFunctionArguments["github"];
}) => {
  const decryptedAssets = [];
  const tweakedAssets = [];

  const releasesIterator = github.paginate.iterator(
    github.rest.repos.listReleases,
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
