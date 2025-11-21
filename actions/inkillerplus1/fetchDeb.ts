import type { AsyncFunctionArguments } from "@actions/github-script";
import type { GitHubRepo } from "../../info.types.ts";
import { inkillerplus1Repo } from "./config.ts";
import { sortAsc } from "../lib/compare.ts";

const debRepo: GitHubRepo = { owner: "iKarwan", repo: "ikarwan.github.io" };

export default async function ({ github, core }: AsyncFunctionArguments) {
  const fetchDebFolder = await github.rest.repos.getContent({
    ...debRepo,
    path: "debs",
  });
  if (!Array.isArray(fetchDebFolder.data))
    return core.setFailed("could not fetch deb folder");
  const debFolder = fetchDebFolder.data
    .filter(
      (x) =>
        x.name.includes("me.ikghd.inkplus_") && x.name.includes("-arm64.deb"),
    )
    .toSorted((a, b) => sortAsc(a.name, b.name));
  for (const debFile of debFolder) {
    if (!debFile.download_url)
      return core.setFailed(`debFile download_url error ${debFile}`);
    const debVersion = debFile.name.split("_")[1];
    console.log("checking", debVersion);

    try {
      await github.rest.repos.getReleaseByTag({
        ...inkillerplus1Repo,
        tag: debVersion,
      });
      console.log(debVersion, "exists");
    } catch (error) {
      const fetchTagStatus = (error as { status: number })?.status;
      if (fetchTagStatus !== 404) return core.setFailed("fetchTag failed");

      // Upload debFile
      const fetchFile = await fetch(debFile.download_url);
      if (!fetchFile.ok) return core.setFailed("fetchFile failed");
      const fileBuffer = Buffer.from(await fetchFile.arrayBuffer());
      const createRelease = await github.rest.repos.createRelease({
        ...inkillerplus1Repo,
        tag_name: debVersion,
      });
      await github.rest.repos.uploadReleaseAsset({
        ...inkillerplus1Repo,
        release_id: createRelease.data.id,
        name: debFile.name,
        data: fileBuffer as unknown as string,
      });
      console.log(debVersion, "uploaded");
    }
  }
}
