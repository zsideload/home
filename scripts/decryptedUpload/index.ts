import { getIpaVersionFilePath } from "@/scripts/lib/getIpaVersion";
import { octokit } from "@/scripts/lib/github";
import { type apps, assetRepo } from "@/scripts/lib/info";
import { basename, resolvePath } from "@/scripts/lib/path";
import { confirm } from "@/scripts/lib/prompt";
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";

export const uploadDecrypted = async ({
  appName,
}: {
  appName: keyof typeof apps;
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
    name: basename(filePath),
    data: readFileSync(filePath) as unknown as string,
  });

  console.log(`Uploaded ${asset.data.name} to ${release.data.html_url}`);
};
