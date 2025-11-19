import type { AsyncFunctionArguments } from "@actions/github-script";
import { apps, tweaks } from "../../info.ts";
import { webBaseUrl } from "../lib/url.ts";
import { sortDesc } from "../lib/compare.ts";
import type { SideloadRepoJson } from "../generateJson/types.ts";

export default async function ({ core }: AsyncFunctionArguments) {
  let appName = core.getInput("appName");
  const tweakName = core.getInput("tweakName");
  const appVersion = core.getInput("appVersion");
  console.log(">>", appName, tweakName, appVersion);
  if (tweakName) {
    appName = tweaks[tweakName].appName;
  }
  console.log(">>", appName, tweakName, appVersion);
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

  return decryptedLink;
}
