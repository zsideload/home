import { apps, tweaks } from "../../info.ts";

export const parseReleaseTagName = (name: string) => {
  const splitted = name.split("_");
  if (splitted.length !== 2) {
    throw new Error("parseReleaseTagName: tag_name length error");
  }
  const appName = splitted[0] as keyof typeof apps;
  if (!apps[appName]) {
    throw new Error("parseReleaseTagName: Unknown appName");
  }
  return {
    appName: appName as keyof typeof apps,
    version: splitted[1],
  };
};

/**
 * Format:
 * Decrypted = `${appName}_${appVersion}_${optionalNotes}.ipa`
 * Tweaked = `${appName}_${appVersion}_${tweakName}_${tweakVersion}_${optionalNotes}.ipa`
 */
export const parseAssetName = (name: string) => {
  const splitted = name.replace(".ipa", "").split("_");

  if (splitted.length < 1 || splitted.length > 5) {
    throw new Error("parseAssetName: name error");
  } else {
    const appName = splitted[0] as keyof typeof apps;
    if (!apps[appName]) {
      throw new Error("parseAssetName: Unknown appName");
    }

    switch (splitted.length) {
      case 2:
      case 3: {
        return {
          type: "decrypted" as const,
          appName,
          appVersion: splitted[1],
          optionalNotes: splitted[2],
        };
      }
      case 4:
      case 5: {
        const tweakName = splitted[2];
        if (!tweaks[tweakName]) {
          throw new Error("parseAssetName: Unknown tweakName");
        }
        return {
          type: "tweaked" as const,
          appName,
          appVersion: splitted[1],
          tweakName,
          tweakVersion: splitted[3],
          optionalNotes: splitted[4],
        };
      }
      default: {
        throw new Error("parseAssetName: name error");
      }
    }
  }
};
