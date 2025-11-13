import process from "node:process";

export const baseUrl = process.env.BASE_URL;
if (!baseUrl) throw new Error("BASE_URL missing");

const webUsername = process.env.WEB_USERNAME;
if (!webUsername) throw new Error("WEB_USERNAME missing");
const webPassword = process.env.WEB_PASSWORD;
if (!webPassword) throw new Error("WEB_PASSWORD missing");

export const baseUrlWithBasicAuth = baseUrl.replace(
  "://",
  `://${webUsername}:${webPassword}@`,
);
