import type { AsyncFunctionArguments } from "@actions/github-script";
import { tweaks } from "../../lib/info.ts";

export default async function ({
  github,
  context,
  core,
}: AsyncFunctionArguments) {
  const tweakName = context.payload.inputs.tweakName;
  const decryptedLink = process.env.DECRYPTED_LINK;
  if (typeof tweakName === "string" && tweakName in tweaks && decryptedLink) {
    core.setSecret(decryptedLink);
    const tweakInfo = tweaks[tweakName as keyof typeof tweaks];
    await github.rest.actions.createWorkflowDispatch({
      owner: tweakInfo.actionRepo.owner,
      repo: tweakInfo.actionRepo.repo,
      workflow_id: tweakInfo.workflow.name,
      ref: tweakInfo.workflow.branch,
      inputs: tweakInfo.workflow.inputs({
        assetDirectDownloadURL: decryptedLink,
      }),
    });
    return core.info("Workflow dispatched");
  } else {
    return core.setFailed("3-dispatch-workflow failed");
  }
}
