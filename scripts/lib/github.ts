import process from "node:process";
import { Octokit } from "octokit";

const SCRIPT_GITHUB_TOKEN = process.env.SCRIPT_GITHUB_TOKEN;
if (!SCRIPT_GITHUB_TOKEN) throw new Error("SCRIPT_GITHUB_TOKEN missing");

export const octokit = new Octokit({ auth: SCRIPT_GITHUB_TOKEN });
