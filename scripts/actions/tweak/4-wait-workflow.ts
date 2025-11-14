import type { AsyncFunctionArguments } from "@actions/github-script";
import { tweaks } from "@/scripts/lib/info";

module.exports = async ({ context, core, github }: AsyncFunctionArguments) => {
	const tweakName = context.payload.inputs.tweakName;
	if (typeof tweakName === "string" && tweakName in tweaks) {
		const tweakInfo = tweaks[tweakName as keyof typeof tweaks];
		let runConclusion = null;
		while (runConclusion !== "success") {
			const listRuns = await github.rest.actions.listWorkflowRuns({
				owner: tweakInfo.actionRepo.owner,
				repo: tweakInfo.actionRepo.repo,
				workflow_id: tweakInfo.workflow.name,
				per_page: 1,
			});
			if (listRuns.data.workflow_runs.length > 0) {
				runConclusion = listRuns.data.workflow_runs[0].conclusion;
				if (runConclusion === "failure") {
					return core.setFailed("workflow run failure");
				}
			} else {
				return core.setFailed("workflow run not found");
			}
		}
	} else {
		return core.setFailed("4-wait-workflow failed");
	}
};
