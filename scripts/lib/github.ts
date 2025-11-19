import process from "node:process";
import { Octokit } from "octokit";

const SCRIPTS_GITHUB_TOKEN = process.env.SCRIPTS_GITHUB_TOKEN;
if (!SCRIPTS_GITHUB_TOKEN) throw new Error("SCRIPTS_GITHUB_TOKEN missing");

export const octokit = new Octokit({ auth: SCRIPTS_GITHUB_TOKEN });
