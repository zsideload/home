import process from "node:process";

export const webBaseUrl = process.env.WEB_BASE_URL;
if (!webBaseUrl) throw new Error("WEB_BASE_URL missing");

const webUsername = process.env.WEB_USERNAME;
if (!webUsername) throw new Error("WEB_USERNAME missing");
const webPassword = process.env.WEB_PASSWORD;
if (!webPassword) throw new Error("WEB_PASSWORD missing");

export const webBaseUrlWithBasicAuth = webBaseUrl.replace(
  "://",
  `://${webUsername}:${webPassword}@`,
);
