import * as fs from "node:fs";
import { join as pathJoin } from "node:path";
import { apps } from "../../info.ts";
import { projectRoot } from "../../actions/lib/path.ts";

const fileList = fs.readdirSync(pathJoin(projectRoot, "./web/public/icon"));

for (const [appName, { bundleIdentifier }] of Object.entries(apps)) {
  const fileListFindResult = fileList.find((x) => x === `${appName}.jpg`);
  if (fileListFindResult) {
    console.log("file exists", appName, fileListFindResult);
    continue;
  } else {
    console.log("file doesn't exists", appName);
    const fetchApi = await fetch(
      `https://itunes.apple.com/lookup?bundleId=${bundleIdentifier}`,
    );
    const { results: apiResults } = (await fetchApi.json()) as {
      results: { artworkUrl100: string }[];
    };
    if (apiResults.length > 0) {
      const artworkUrl100 = apiResults[0].artworkUrl100;
      const wantedUrl =
        artworkUrl100.slice(0, artworkUrl100.lastIndexOf("/")) +
        "/200x200ia-75.jpg";
      const fetchIcon = await fetch(wantedUrl);
      fs.writeFileSync(
        pathJoin(projectRoot, "./web/public/icon/", `${appName}.jpg`),
        Buffer.from(await fetchIcon.arrayBuffer()),
      );
    }
  }
}
