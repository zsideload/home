import type { AsyncFunctionArguments } from "@actions/github-script";
import type { SideloadRepoJson } from "../generateJson/types.ts";
import { inkillerplusAssetsRepo } from "./config.ts";

export default async function ({ github, core }: AsyncFunctionArguments) {
  const fetchRepo = await fetch("https://repo.ikghd.me/repo.json");
  if (!fetchRepo.ok) return core.setFailed("fetchRepo failed");
  const repoData = (await fetchRepo.json()) as SideloadRepoJson;
  const instagramData = repoData.apps.filter((x) => x.name === "Instagram");
  if (instagramData.length !== 1)
    return core.setFailed(`instagramData failed ${instagramData.length}`);
  const appVersion = instagramData[0].version;
  const downloadURL = instagramData[0].downloadURL;
  const tweakVersion = downloadURL
    .slice(downloadURL.lastIndexOf("/"))
    .replace(".ipa", "")
    .split("_")
    .at(3);

  if (tweakVersion) {
    try {
      await github.rest.repos.getReleaseByTag({
        ...inkillerplusAssetsRepo,
        tag: tweakVersion,
      });
      core.setOutput("appVersion", appVersion);
      core.setOutput("tweakVersion", tweakVersion);
      return;
    } catch (error) {
      return core.setFailed("checkIfWeHaveTweakVersion failed");
    }
  }
  return core.setFailed("getRecommendedVersion failed");
}
