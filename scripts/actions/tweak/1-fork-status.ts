import type { AsyncFunctionArguments } from "@actions/github-script";
import { tweaks } from "../../lib/info";

module.exports = async ({ github, context, core }: AsyncFunctionArguments) => {
	const tweakName = context.payload.inputs.tweakName;
	if (typeof tweakName === "string" && tweakName in tweaks) {
		const tweakInfo = tweaks[tweakName as keyof typeof tweaks];
		if (tweakInfo.actionRepo.basehead) {
			// has a fork
			const compare = await github.rest.repos.compareCommitsWithBasehead(
				tweakInfo.actionRepo,
			);
			const status = compare.data.status;
			if (status === "identical") {
				// upstream is identical to fork
				core.info("Upstream identical");
			} else if (status === "ahead") {
				// upstream is ahead of fork
				return core.setFailed(
					"Upstream is ahead of fork \n" +
						`https://github.com/${tweakInfo.actionRepo.owner}/${tweakInfo.actionRepo.repo}/` +
						`compare/${encodeURIComponent(tweakInfo.actionRepo.basehead)}`,
				);
			} else {
				// other status (diverged, behind)
				return core.setFailed(
					`Fork status = ${status} \n` +
						`https://github.com/${tweakInfo.actionRepo.owner}/${tweakInfo.actionRepo.repo}/`,
				);
			}
		} else {
			// no fork
			return core.info("No fork");
		}
	}
	return core.setFailed("1-fork-status failed");
};
