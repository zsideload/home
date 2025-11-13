import process from "node:process";
import { Octokit } from "octokit";

const GH_TOKEN = process.env.GH_TOKEN;
if (!GH_TOKEN) throw new Error("GH_TOKEN missing");

export const octokit = new Octokit({ auth: GH_TOKEN });
