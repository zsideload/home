import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { Octokit } from "octokit";
import decryptedJson from "../../generated/decrypted.json" with { type: "json" };
import decryptedLatestJson from "../../generated/decryptedlatest.json" with { type: "json" };
import tweakedJson from "../../generated/tweaked.json" with { type: "json" };
import tweakedLatestJson from "../../generated/tweakedlatest.json" with { type: "json" };
import { assetRepo } from "../../info";
import { checkOutdated } from "../../scripts/checkOutdated/helper";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    octokit: Octokit;
  };
}>();

app.get("/outdated", async (c) => {
  const result = await checkOutdated({
    decryptedlatest: decryptedLatestJson,
    tweakedlatest: tweakedLatestJson,
  });
  return c.json(result);
});

// --- Routes after this require authentication --- //
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

app.get("/tweaked.json", async (c) => {
  return c.json(tweakedJson);
});

app.get("/tweakedlatest.json", async (c) => {
  return c.json(tweakedLatestJson);
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

  const assets = await octokit.rest.repos.getReleaseAsset({
    ...assetRepo,
    asset_id: +id,
    headers: {
      accept: "application/octet-stream",
    },
    request: {
      redirect: "manual",
    },
  });

  if (assets.headers.location) return c.redirect(assets.headers.location);
});

export default app;
