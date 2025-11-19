import type { Octokit } from "octokit";

export type GitHubRepo = { owner: string; repo: string };

export type GitHubActionsWorkflowInputs = NonNullable<
  Parameters<
    InstanceType<typeof Octokit>["rest"]["actions"]["createWorkflowDispatch"]
  >[0]
>["inputs"];

export type Apps = { [appName: string]: { bundleIdentifier: string } };

export type Tweaks<T extends Apps> = {
  [tweakName: string]: {
    appName: keyof T;
    actionRepo: GitHubRepo & {
      basehead?: string;
    };
    workflow: {
      branch: string;
      name: string;
      optionalNotes?: string;
      inputs: ({
        assetDirectDownloadURL,
      }: {
        assetDirectDownloadURL: string;
      }) => GitHubActionsWorkflowInputs;
      getTweakVersion: ({
        builtFileName,
        head_sha,
      }: {
        builtFileName: string;
        head_sha?: string;
      }) => Promise<string>;
    };
  };
};
