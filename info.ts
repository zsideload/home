import type { Apps, GitHubRepo, Tweaks } from "./info.types.ts";

export const assetRepo = {
  owner: "zsideload",
  repo: "assets",
} as const satisfies GitHubRepo;

export const apps = {
  YouTube: {
    bundleIdentifier: "com.google.ios.youtube",
  },
  YouTubeMusic: {
    bundleIdentifier: "com.google.ios.youtubemusic",
  },
} as const satisfies Apps;

export const tweaks: Tweaks<typeof apps> = {
  YTLite: {
    appName: "YouTube",
    actionRepo: {
      owner: "zsideload",
      repo: "YTLite",
      basehead: "main...dayanch96:YTLite:main",
    },
    workflow: {
      branch: "main",
      name: "main.yml",
      optionalNotes: "WithYouPiPOnly",
      inputs: ({ assetDirectDownloadURL }) => ({
        enable_youpip: true,
        enable_ytuhd: false,
        enable_yq: false,
        enable_ryd: false,
        enable_demc: false,
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
} as const;
