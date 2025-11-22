import type { AsyncFunctionArguments } from "@actions/github-script";
import { assetRepo } from "../../info.ts";

export default async function ({ github, core }: AsyncFunctionArguments) {
  const asset_id = process.env.ASSET_ID;
  if (asset_id) {
    const response = await github.rest.repos.getReleaseAsset({
      ...assetRepo,
      asset_id: +asset_id,
      headers: {
        accept: "application/octet-stream",
      },
      request: {
        redirect: "manual",
      },
    });
    const downloadUrl = response.headers.location;
    if (downloadUrl) {
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok)
        return core.info(`cacheWarmUp error ${fileResponse.status}`);

      if (fileResponse.body) {
        let totalBytes = 0;
        for await (const chunk of fileResponse.body) {
          totalBytes += chunk.length;
        }
        console.log("totalBytes:", totalBytes);
      } else {
        console.log("fileResponse.body is null");
      }
    }
  } else {
    return core.info("No ASSET_ID provided to cacheWarmUp");
  }
}
