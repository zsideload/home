// import { aNewerThanB } from "./actions/lib/compare.ts";
//
// const aNewer = (a: string, b: string) => {
//   console.log(a, b, aNewerThanB(a, b));
// };
//
// aNewer(
//   "Instagram_417.1.0_iNKillerPlusRecommended_3.5.ipa",
//   "Instagram_417.1.0_iNKillerPlusRecommended_3.5.1.ipa",
// );
//
// aNewer(
//   "Instagram_417.1.0_iNKillerPlusRecommended_3.5.1.ipa",
//   "Instagram_417.1.0_iNKillerPlusRecommended_3.5.ipa",
// );
//
// aNewer("Instagram_417.1.0_iNKillerPlusRecommended_3.5.1.ipa", "");

import generateJson from "./actions/generateJson/index.ts";
import { octokit } from "./scripts/lib/github.ts";

await generateJson({ github: octokit });
