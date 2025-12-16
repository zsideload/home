import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { octokit } from "../lib/github.ts";
import { getIpaVersionFilePath } from "../../actions/lib/getIpaVersion.ts";
import { actionRepo, assetRepo } from "../../info.ts";
import { basename, resolvePath } from "../../actions/lib/path.ts";
import { confirm } from "../lib/prompt.ts";

const { positionals } = parseArgs({ allowPositionals: true });
const appName = positionals[0];
if (!appName) throw new Error("Missing appName");
const filePathArgument = positionals[1];
if (!filePathArgument) throw new Error("Missing filePathArgument");
let optionalNotes = positionals[2];

const filePath = resolvePath(filePathArgument);
const ipaVersion = await getIpaVersionFilePath(filePath);
const tagName = `${appName}_${ipaVersion}`;
if (basename(filePath).includes("-eeveedecrypter")) {
  optionalNotes = optionalNotes
    ? `eeveedecrypter-${optionalNotes}`
    : "eeveedecrypter";
} else if (basename(filePath).includes("-Decrypted")) {
  optionalNotes = optionalNotes
    ? `armconverter-${optionalNotes}`
    : "armconverter";
} else if (basename(filePath).includes("_decrypt_")) {
  optionalNotes = optionalNotes ? `anyipa-${optionalNotes}` : "anyipa";
}
const fileName = optionalNotes
  ? `${appName}_${ipaVersion}_${optionalNotes}.ipa`
  : `${appName}_${ipaVersion}.ipa`;

console.log("- Creating release", tagName);
console.log("- Uploading", filePath);
console.log("- Renaming", fileName);
console.log();
await confirm();

const release = await octokit.rest.repos.createRelease({
  ...assetRepo,
  tag_name: tagName,
});

// const release = await octokit.rest.repos.getReleaseByTag({
//   ...assetRepo,
//   tag: tagName,
// });

if (!release.data.id) throw new Error("createRelease error");

const asset = await octokit.rest.repos.uploadReleaseAsset({
  ...assetRepo,
  release_id: release.data.id,
  name: fileName,
  data: readFileSync(filePath) as unknown as string,
});

console.log(`Uploaded ${asset.data.name} to ${release.data.html_url}`);

await octokit.rest.actions.createWorkflowDispatch({
  ...actionRepo,
  workflow_id: "generateJsonAndDeploy.yml",
  ref: "main",
});
console.log("generateJsonAndDeploy dispatched");
