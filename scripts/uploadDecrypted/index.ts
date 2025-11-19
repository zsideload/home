import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { octokit } from "../lib/github.ts";
import { getIpaVersionFilePath } from "../../actions/lib/getIpaVersion.ts";
import { type apps, assetRepo } from "../../info.ts";
import { resolvePath } from "../../actions/lib/path.ts";
import { confirm } from "../lib/prompt.ts";

export const uploadDecrypted = async ({
  appName,
  optionalNotes,
}: {
  appName: keyof typeof apps;
  optionalNotes?: string;
}) => {
  const { positionals } = parseArgs({ allowPositionals: true });
  if (positionals.length !== 1) throw new Error("Missing file path");
  const filePathArgument = positionals[0];

  const filePath = resolvePath(filePathArgument);
  const ipaVersion = await getIpaVersionFilePath(filePath);
  const tagName = `${appName}_${ipaVersion}`;

  console.log("- Creating release", tagName);
  console.log("- Uploading", filePath);
  console.log();
  await confirm();

  const release = await octokit.rest.repos.createRelease({
    ...assetRepo,
    tag_name: tagName,
  });

  if (!release.data.id) throw new Error("createRelease error");

  const asset = await octokit.rest.repos.uploadReleaseAsset({
    ...assetRepo,
    release_id: release.data.id,
    name: optionalNotes
      ? `${appName}_${ipaVersion}_${optionalNotes}.ipa`
      : `${appName}_${ipaVersion}.ipa`,
    data: readFileSync(filePath) as unknown as string,
  });

  console.log(`Uploaded ${asset.data.name} to ${release.data.html_url}`);
};
