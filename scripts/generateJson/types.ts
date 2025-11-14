export type SideloadRepoJson = {
  name: string;
  identifier: string;
  iconURL: string;
  apps: {
    name: string | null;
    bundleIdentifier: string;
    version: string;
    localizedDescription: string;
    downloadURL: string;
    iconURL: string;
    versionDate: string;
    size: number;
  }[];
};
