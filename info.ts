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
  Apollo: {
    bundleIdentifier: "com.christianselig.Apollo",
  },
  Facebook: {
    bundleIdentifier: "com.facebook.Facebook",
  },
  Infuse: {
    bundleIdentifier: "com.firecore.infuse",
  },
  Instagram: {
    bundleIdentifier: "com.burbn.instagram",
  },
  TikTok: {
    bundleIdentifier: "com.zhiliaoapp.musically",
    // Global Version bundleIdentifier: "com.ss.iphone.ugc.Ame"
  },
  X: {
    bundleIdentifier: "com.atebits.Tweetie2",
  },
  YouTube: {
    bundleIdentifier: "com.google.ios.youtube",
  },
  YouTubeMusic: {
    bundleIdentifier: "com.google.ios.youtubemusic",
  },
  MovieApp: {
    bundleIdentifier: "zsideload.movieapp",
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
  BHTwitter: {
    appName: "X",
    actionRepo: {
      owner: "zsideload",
      repo: "BHTwitter",
      basehead: "master...BandarHL:BHTwitter:master",
    },
    workflow: {
      branch: "modified",
      name: "build.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        decrypted_ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  FacebookGlow: {
    appName: "Facebook",
    actionRepo: {
      owner: "zsideload",
      repo: "Glow",
      basehead: "main...dayanch96:Glow:main",
    },
    workflow: {
      branch: "main",
      name: "main.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[2].replace(".ipa", "").replace("v", ""),
    },
  },
  ApolloICA: {
    appName: "Apollo",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "apollo.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", "").replace("v", ""),
    },
  },
  iNKillerPlusRecommended: {
    appName: "Instagram",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "inkillerplus.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  iNKillerPlusLatest: {
    appName: "Instagram",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "inkillerplus.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  iNKillerPlus1: {
    appName: "Instagram",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "inkillerplus1.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  Theta: {
    appName: "Instagram",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "theta.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  InstaLRD: {
    appName: "Instagram",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "instalrd.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  Regram1: {
    appName: "Instagram",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "regram1.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  SCInsta: {
    appName: "Instagram",
    actionRepo: {
      owner: "zsideload",
      repo: "SCInsta",
      basehead: "dev...SoCuul:SCInsta:dev",
    },
    workflow: {
      branch: "dev",
      name: "buildapp.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        decrypted_instagram_url: assetDirectDownloadURL,
        upload_artifact: false,
      }),
      getTweakVersion: async ({ builtFileName, head_sha }) => {
        const version = builtFileName
          .split("_")[2]
          .replace(".ipa", "")
          .replace("v", "");
        const partialHash = head_sha?.slice(0, 7);
        return `${version}-dev.${partialHash}`;
      },
    },
  },
  InfusePlus: {
    appName: "Infuse",
    actionRepo: {
      owner: "zsideload",
      repo: "InfusePlus",
      basehead: "main...dayanch96:InfusePlus:main",
    },
    workflow: {
      branch: "main",
      name: "main.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
  RXTikTok: {
    appName: "TikTok",
    actionRepo: actionRepo,
    workflow: {
      branch: "main",
      name: "rxtiktok.yml",
      inputs: ({ assetDirectDownloadURL }) => ({
        ipa_url: assetDirectDownloadURL,
      }),
      getTweakVersion: async ({ builtFileName }) =>
        builtFileName.split("_")[1].replace(".ipa", ""),
    },
  },
} as const;
