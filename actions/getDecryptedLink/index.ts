import type { AsyncFunctionArguments } from "@actions/github-script";
import { apps, assetRepo, tweaks } from "../../info.ts";
import { webBaseUrl } from "../lib/url.ts";
import { sortDesc } from "../lib/compare.ts";
import type { SideloadRepoJson } from "../generateJson/types.ts";

export default async function ({ github, core }: AsyncFunctionArguments) {
  let appName = process.env.APP_NAME;
  const tweakName = process.env.TWEAK_NAME;
  const appVersion = process.env.APP_VERSION;
  if (tweakName) {
    appName = tweaks[tweakName].appName;
  }
  if (!appName || typeof appName !== "string" || !(appName in apps)) {
    return core.setFailed("appName invalid");
  }
  if (!webBaseUrl) {
    return core.setFailed("webBaseUrl invalid");
  }
  core.setSecret(webBaseUrl);

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
    return core.setFailed(`HTTP error! status: ${fetchDecrypted.status}`);
  }
  const dataFromFetchDecrypted =
    (await fetchDecrypted.json()) as SideloadRepoJson;
  const thisAppData = dataFromFetchDecrypted.apps.filter(
    (app) => app.name === appName,
  );
  let myDownloadURL: string = "";
  if (appVersion === "latest" || !appVersion) {
    const latest = thisAppData
      .sort((a, b) => sortDesc(a.version, b.version))
      .at(0);
    if (!latest) return core.setFailed("latest appVersion not found");
    myDownloadURL = latest.downloadURL;
  } else {
    const specificVersion = thisAppData.find((x) => x.version === appVersion);
    if (!specificVersion)
      return core.setFailed(`appVersion ${appVersion} not found`);
    myDownloadURL = specificVersion.downloadURL;
  }
  let decryptedLink;
  let assetId = myDownloadURL.match(/\/download\/(\d+)\//)?.at(1);
  if (assetId) {
    const assetRequest = await github.request(
      "HEAD /repos/{owner}/{repo}/releases/assets/{asset_id}",
      {
        ...assetRepo,
        asset_id: +assetId,
        headers: {
          accept: "application/octet-stream",
        },
      },
    );
    decryptedLink = assetRequest.url;
    console.log(assetRequest.url);
  }
  if (!decryptedLink) return core.setFailed("no link");
  console.log(decryptedLink);

  return decryptedLink;
}
