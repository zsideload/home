import { webBaseUrl } from "../../actions/lib/url.ts";
import type { SideloadRepoJson } from "../../actions/generateJson/types.ts";
import { apps } from "../../info.ts";

const getAppstoreInfo = async (bundleIdentifier: string) => {
  const fetchResult = await fetch(
    `https://itunes.apple.com/lookup?bundleId=${bundleIdentifier}&cacheBusting=${new Date().getTime()}`,
  );
  const { results } = (await fetchResult.json()) as {
    results: { version: string; trackViewUrl: string }[];
  };

  if (results.length > 0)
    return { version: results[0].version, url: results[0].trackViewUrl };
};

const compareOutdated = (
  appName: string,
  version: string,
  latestVersion: string,
) => {
  const skipList = ["Apollo"];
  if (skipList.includes(appName)) {
    return;
  }
  if (version !== latestVersion) {
    return "✓";
  }
  return;
};

const fetchDecryptedLatest = await fetch(`${webBaseUrl}/decryptedlatest.json`, {
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(
        `${process.env.WEB_USERNAME}:${process.env.WEB_PASSWORD}`,
      ).toString("base64"),
  },
});
if (!fetchDecryptedLatest.ok) throw new Error("error fetching");
const decryptedlatest = (await fetchDecryptedLatest.json()) as SideloadRepoJson;

const resultTable = [];

for (const appName of Object.keys(apps)) {
  console.log("Checking", appName);
  const appInfo = apps[appName as keyof typeof apps];
  const decryptedInfo = decryptedlatest.apps.find(
    (x) => x.bundleIdentifier === appInfo.bundleIdentifier,
  );
  const appStoreInfo = await getAppstoreInfo(appInfo.bundleIdentifier);
  if (decryptedInfo && appStoreInfo) {
    resultTable.push({
      app: appName,
      version: decryptedInfo.version,
      latestVersion: appStoreInfo.version,
      outdated: compareOutdated(
        appName,
        decryptedInfo.version,
        appStoreInfo.version,
      ),
      url: appStoreInfo.url,
    });
  } else {
    resultTable.push({
      app: appName,
      version: undefined,
      latestVersion: appStoreInfo?.version,
      outdated: undefined,
      url: appStoreInfo?.url,
    });
  }
}

console.table(resultTable);
