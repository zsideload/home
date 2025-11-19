import type { AsyncFunctionArguments } from "@actions/github-script";
import { tweaks } from "../../info.ts";
import { webBaseUrl } from "../lib/url.ts";
import { sortDesc } from "../lib/compare.ts";
import type { SideloadRepoJson } from "../generateJson/types.ts";

export default async function ({
  github,
  context,
  core,
}: AsyncFunctionArguments) {
  //#region globals
  const tweakName = context.payload.inputs.tweakName;
  if (!tweakName || typeof tweakName !== "string" || !(tweakName in tweaks)) {
    return core.setFailed("tweakName invalid");
  }
  const tweakInfo = tweaks[tweakName];
  const appVersion = context.payload.inputs.appVersion;
  if (!webBaseUrl) {
    return core.setFailed("webBaseUrl invalid");
  }
  core.setSecret(webBaseUrl);
  //#endregion

  //#region check fork status
  console.log("::group::check fork status");
  if (tweakInfo.actionRepo.basehead) {
    const compare = await github.rest.repos.compareCommitsWithBasehead({
      owner: tweakInfo.actionRepo.owner,
      repo: tweakInfo.actionRepo.repo,
      basehead: tweakInfo.actionRepo.basehead,
    });
    const status = compare.data.status;
    if (status === "identical") {
      console.log("upstream is identical to fork");
    } else if (status === "ahead") {
      return core.setFailed(
        "upstream is ahead of fork \n" +
          `https://github.com/${tweakInfo.actionRepo.owner}/${tweakInfo.actionRepo.repo}/` +
          `compare/${encodeURIComponent(tweakInfo.actionRepo.basehead)}`,
      );
    } else {
      return core.setFailed(
        `other status (${status}) \n` +
          `https://github.com/${tweakInfo.actionRepo.owner}/${tweakInfo.actionRepo.repo}/`,
      );
    }
  } else {
    console.log("no fork");
  }
  console.log("::endgroup::");
  //#endregion

  //#region get decrypted link
  console.log("::group::get decrypted link");
  const fetchDecrypted = await fetch(`${webBaseUrl}/decrypted.json`, {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.WEB_USERNAME}:${process.env.WEB_PASSWORD}`,
        ).toString("base64"),
    },
  });
  if (!fetchDecrypted.ok) {
    throw new Error(`HTTP error! status: ${fetchDecrypted.status}`);
  }
  const dataFromFetchDecrypted =
    (await fetchDecrypted.json()) as SideloadRepoJson;
  const thisAppData = dataFromFetchDecrypted.apps.filter(
    (app) => app.name === tweakInfo.appName,
  );
  let decryptedLink: string = "";
  if (appVersion === "latest" || !appVersion) {
    const latest = thisAppData
      .sort((a, b) => sortDesc(a.version, b.version))
      .at(0);
    if (!latest) return core.setFailed("latest appVersion not found");
    decryptedLink = latest.downloadURL;
  } else {
    const specificVersion = thisAppData.find((x) => x.version === appVersion);
    if (!specificVersion)
      return core.setFailed(`appVersion ${appVersion} not found`);
    decryptedLink = specificVersion.downloadURL;
  }
  if (!decryptedLink) return core.setFailed("no link");
  core.setSecret(decryptedLink);
  console.log("::endgroup::");
  //#endregion

  //#region dispatch workflow
  console.log("::group::dispatch workflow");
  await github.rest.actions.createWorkflowDispatch({
    owner: tweakInfo.actionRepo.owner,
    repo: tweakInfo.actionRepo.repo,
    workflow_id: tweakInfo.workflow.name,
    ref: tweakInfo.workflow.branch,
    inputs: tweakInfo.workflow.inputs({
      assetDirectDownloadURL: decryptedLink,
    }),
  });
  console.log("::endgroup::");
  //#endregion

  //#region wait for workflow
  console.log("::group::wait for workflow");
  let runConclusion = null;
  let head_sha = null;
  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
  const fifteenSeconds = 15_000;
  let timeElapsed = 0;
  while (runConclusion !== "success") {
    console.log(`${timeElapsed} seconds elapsed`);
    await new Promise((r) => setTimeout(r, fifteenSeconds));
    const listRuns = await github.rest.actions.listWorkflowRuns({
      owner: tweakInfo.actionRepo.owner,
      repo: tweakInfo.actionRepo.repo,
      workflow_id: tweakInfo.workflow.name,
      created: `>=${tenMinutesAgo.toISOString()}`,
    });
    if (listRuns.data.workflow_runs.length > 0) {
      const latestRun = listRuns.data.workflow_runs.sort((a, b) =>
        sortDesc(a.created_at, b.created_at),
      )[0];
      runConclusion = latestRun.conclusion;
      console.log("runConclusion:", runConclusion);
      if (runConclusion === "failure") {
        return core.setFailed("workflow run failure");
      }
      head_sha = latestRun.head_sha;
    } else {
      return core.setFailed("workflow run not found");
    }
  }
  console.log("::endgroup::");
  //#endregion

  return head_sha;
}
