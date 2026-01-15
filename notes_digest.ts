import { octokit } from "./scripts/lib/github.ts";
import { inkillerplusAssetsRepo } from "./actions/inkillerplus/config.ts";

const release = await octokit.rest.repos.getReleaseByTag({
  ...inkillerplusAssetsRepo,
  tag: "3.0.3",
});
console.log(release.data.assets.at(0)?.digest);
