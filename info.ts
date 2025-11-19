import type { Apps, GitHubRepo, Tweaks } from "./info.types.ts";

export const actionRepo = {
  owner: "zsideload",
  repo: "home",
} as const satisfies GitHubRepo;

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
  YTMusicUltimate: {
    appName: "YouTubeMusic",
    actionRepo: {
      owner: "zsideload",
      repo: "YTMusicUltimate",
      basehead: "main...dayanch96:YTMusicUltimate:main",
    },
    workflow: {
      branch: "main",
      name: "main.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ head_sha }) => {
        const fetchFile = await fetch(
          `https://raw.githubusercontent.com/zsideload/YTMusicUltimate/${head_sha}/Makefile`,
        );
        if (!fetchFile.ok) {
          throw new Error(`Response status: ${fetchFile.status}`);
        }
        const file = await fetchFile.text();

        const match = file.match(/^\s*PACKAGE_VERSION\s*=\s*(\S+)\s*$/m);
        if (!match || match.length < 2)
          throw new Error("Tweak Version Not Found");
        return match[1];
      },
    },
  },
} as const;
