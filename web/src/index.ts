import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { Octokit } from "octokit";
import decryptedJson from "../../generated/decrypted.json" with { type: "json" };
import decryptedLatestJson from "../../generated/decryptedlatest.json" with { type: "json" };
import latestJson from "../../generated/latest.json" with { type: "json" };
import { assetRepo } from "../../info";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    octokit: Octokit;
  };
}>();

app.use(
  "/*",
  // Basic Auth Middleware
  async (c, next) => {
    if (!c.env.WEB_USERNAME || !c.env.WEB_PASSWORD) {
      console.error(
        "WEB_USERNAME or WEB_PASSWORD is not set in Cloudflare environment",
      );
      return c.json({ error: "Server configuration error" }, 500);
    }
    const auth = basicAuth({
      username: c.env.WEB_USERNAME,
      password: c.env.WEB_PASSWORD,
    });
    return auth(c, next);
  },
  // Octokit Middleware
  async (c, next) => {
    if (c.get("octokit")) {
      return await next();
    }
    const token = c.env.WEB_GITHUB_TOKEN;
    if (!token) {
      console.error("WEB_GITHUB_TOKEN is not set in Cloudflare environment");
      return c.json({ error: "Server configuration error" }, 500);
    }

    const octokit = new Octokit({
      auth: token,
    });
    c.set("octokit", octokit);
    await next();
  },
);

app.get("/latest.json", async (c) => {
  return c.json(latestJson);
});

app.get("/decrypted.json", async (c) => {
  return c.json(decryptedJson);
});

app.get("/decryptedlatest.json", async (c) => {
  return c.json(decryptedLatestJson);
});

app.get("/download/:id/:name?", async (c) => {
  const { id } = c.req.param();
  const octokit = c.get("octokit");

  const assets = await octokit.request(
    "HEAD /repos/{owner}/{repo}/releases/assets/{asset_id}",
    {
      ...assetRepo,
      asset_id: +id,
      headers: {
        accept: "application/octet-stream",
      },
    },
  );

  if (assets.url) return c.redirect(assets.url);
});

export default app;
