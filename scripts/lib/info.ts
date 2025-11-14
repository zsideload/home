import type { Apps, GitHubRepo, Tweaks } from "./info.types.ts";

export const assetRepo = {
  owner: "xsideload",
  repo: "assets-test",
} as const satisfies GitHubRepo;

export const apps = {
  YouTube: {
    bundleIdentifier: "com.google.ios.youtube",
  },
  YouTubeMusic: {
    bundleIdentifier: "com.google.ios.youtubemusic",
  },
} as const satisfies Apps;

export const tweaks = {
  YTLite: {
    appName: "YouTube",
    actionRepo: {
      owner: "xsideload",
      repo: "YTLite",
      basehead: "main...dayanch96:YTLite:main",
    },
    workflow: {
      branch: "main",
      name: "main.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        enable_youpip: true,
        enable_ytuhd: true,
        enable_yq: true,
        enable_ryd: true,
        enable_demc: true,
        ipa_url: assetDirectDownloadURL,
      }),
    },
  },
} as const satisfies Tweaks<typeof apps>;
