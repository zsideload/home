import type { AsyncFunctionArguments } from "@actions/github-script";
import type { SideloadRepoJson } from "../../generateJson/types.ts";
import { sortDesc } from "../../lib/compare.ts";
import { tweaks } from "../../lib/info.ts";
import { baseUrl } from "../../lib/url.ts";

export default async function ({ context, core }: AsyncFunctionArguments) {
  const tweakName = context.payload.inputs.tweakName;
  const appVersion = context.payload.inputs.appVersion;
  if (typeof tweakName === "string" && tweakName in tweaks && baseUrl) {
    core.setSecret(baseUrl);
    const fetchDecrypted = await fetch(`${baseUrl}/decrypted.json`, {
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
    const data = (await fetchDecrypted.json()) as SideloadRepoJson;
    const thisAppData = data.apps.filter((app) => app.name === tweakName);
    let link: string = "";
    if (appVersion === "latest" || !appVersion) {
      const latest = thisAppData
        .sort((a, b) => sortDesc(a.version, b.version))
        .at(0);
      if (!latest) return core.setFailed("latest appVersion not found");
      link = latest.downloadURL;
    } else {
      const specificVersion = thisAppData.find((x) => x.version === appVersion);
      if (!specificVersion)
        return core.setFailed(`appVersion ${appVersion} not found`);
      link = specificVersion.downloadURL;
    }
    if (!link) return core.setFailed("no link");
    core.setSecret(link);
    core.setOutput("decrypted_link", link);
  } else {
    return core.setFailed("2-decrypted-link failed");
  }
}
