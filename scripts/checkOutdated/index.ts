import { webBaseUrl } from "../../actions/lib/url.ts";
import { aNewerThanB } from "../../actions/lib/compare.ts";
import type { SideloadRepoJson } from "../../actions/generateJson/types.ts";
import { apps } from "../../info.ts";
type AppName = keyof typeof apps;

const getAppstoreInfo = async (appName: string, bundleIdentifier: string) => {
  const skipList: AppName[] = ["MovieApp"];
  if (skipList.includes(appName as AppName)) {
    return;
  }
  const fetchResult = await fetch(
    `https://itunes.apple.com/lookup?bundleId=${bundleIdentifier}&cacheBusting=${new Date().getTime()}`,
  );
  const { results } = (await fetchResult.json()) as {
    results: { version: string; trackViewUrl: string }[];
  };

  if (results.length > 0)
    return { version: results[0].version, url: results[0].trackViewUrl };
};

const compareANewerThanB = (appName: string, a: string, b: string) => {
  const skipList: AppName[] = ["Apollo"];
  if (skipList.includes(appName as AppName)) {
    return;
  }
  if (aNewerThanB(a, b)) {
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

const fetchTweakedLatest = await fetch(`${webBaseUrl}/tweakedlatest.json`, {
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(
        `${process.env.WEB_USERNAME}:${process.env.WEB_PASSWORD}`,
      ).toString("base64"),
  },
});
if (!fetchTweakedLatest.ok) throw new Error("error fetching");
const tweakedlatest = (await fetchTweakedLatest.json()) as SideloadRepoJson;

const resultTable = [];

for (const appName of Object.keys(apps)) {
  console.log("Checking", appName);
  const appInfo = apps[appName as keyof typeof apps];
  const decryptedInfo = decryptedlatest.apps.find(
    (x) => x.bundleIdentifier === appInfo.bundleIdentifier,
  );
  const tweakedInfo = tweakedlatest.apps.find(
    (x) => x.bundleIdentifier === appInfo.bundleIdentifier,
  );
  const appStoreInfo = await getAppstoreInfo(appName, appInfo.bundleIdentifier);
  resultTable.push({
    app: appName,
    appstore: appStoreInfo?.version,
    decrypted: decryptedInfo?.version,
    d_outdated:
      decryptedInfo && appStoreInfo
        ? compareANewerThanB(
            appName,
            appStoreInfo.version,
            decryptedInfo.version,
          )
        : undefined,
    tweaked: tweakedInfo?.version.split("_")[0],
    t_outdated:
      tweakedInfo && appStoreInfo
        ? compareANewerThanB(
            appName,
            appStoreInfo.version,
            tweakedInfo.version.split("_")[0],
          )
        : undefined,
    url: appStoreInfo?.url.replace("?uo=4", ""),
  });
}

console.table(resultTable);
