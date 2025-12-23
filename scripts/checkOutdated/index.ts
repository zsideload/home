import { webBaseUrl } from "../../actions/lib/url.ts";
import type { SideloadRepoJson } from "../../actions/generateJson/types.ts";
import { checkOutdated } from "./helper.ts";

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

const resultTable = await checkOutdated({
  decryptedlatest,
  tweakedlatest,
});

console.table(resultTable);
