import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

function moduleAssets(html, origin) {
  const assets = new Set();
  // Read emitted tags only; never execute scripts or follow links embedded in script bodies.
  const tags = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .matchAll(
      /<script\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>[\s\S]*?<\/script\s*>|<link\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi,
    );
  for (const tag of tags) {
    const attributes = new Map();
    for (const attribute of (tag[1] ?? tag[2]).matchAll(
      /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g,
    )) {
      attributes.set(
        attribute[1].toLowerCase(),
        attribute[2] ?? attribute[3] ?? attribute[4] ?? "",
      );
    }
    const moduleScript =
      tag[1] !== undefined && attributes.get("type")?.trim().toLowerCase() === "module";
    const modulePreload =
      tag[2] !== undefined &&
      attributes.get("rel")?.toLowerCase().split(/\s+/).includes("modulepreload");
    if (!moduleScript && !modulePreload) continue;
    const reference = attributes.get(moduleScript ? "src" : "href");
    if (!reference) continue;
    const url = new URL(reference, `${origin}/`);
    if (
      url.origin === origin &&
      url.pathname.startsWith("/assets/") &&
      url.pathname.endsWith(".js")
    ) {
      url.hash = "";
      assets.add(url.href);
    }
  }
  assert.ok(assets.size > 0, "/ has no same-origin /assets/ module scripts or modulepreloads");
  return [...assets];
}

export async function probeDeployment(origin, expectedCommit, signal) {
  const request = (url, options = {}) =>
    fetch(url, {
      ...options,
      redirect: "error",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15_000)])
        : AbortSignal.timeout(15_000),
    });
  const marker = await request(`${origin}/build-info.json`, { cache: "no-store" });
  assert.equal(marker.status, 200, "deployment marker must return 200");
  assert.match(marker.headers.get("content-type") ?? "", /^application\/json(?:\s*;|$)/i);
  const deployed = await marker.json();
  assert.equal(
    deployed.commit,
    expectedCommit,
    `production reports ${deployed.commit ?? "no commit"}`,
  );

  const home = await request(`${origin}/`);
  assert.equal(home.status, 200, "/ must return 200");
  assert.match(home.headers.get("content-type") ?? "", /^text\/html(?:\s*;|$)/i);
  const assets = moduleAssets(await home.text(), origin);
  for (let offset = 0; offset < assets.length; offset += 4) {
    // Settle the whole batch before retrying so outstanding requests never overlap polls.
    const results = await Promise.allSettled(
      assets.slice(offset, offset + 4).map(async (url) => {
        const response = await request(url, { method: "HEAD" });
        try {
          assert.equal(response.status, 200, `${url} must return 200`);
          assert.match(
            response.headers.get("content-type") ?? "",
            /^(?:text|application)\/javascript(?:\s*;|$)/i,
            `${url} must return JavaScript`,
          );
        } finally {
          await response.body?.cancel();
        }
      }),
    );
    const failed = results.find((result) => result.status === "rejected");
    if (failed) throw failed.reason;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const expectedCommit = process.env.EXPECTED_COMMIT?.toLowerCase();
  const origin = new URL(process.env.DOCS_TEST_URL ?? "https://neobrutal-ui.andongmin.com").origin;
  assert.match(expectedCommit ?? "", /^[\da-f]{40}$/, "EXPECTED_COMMIT must be a full Git SHA");
  const deadline = Date.now() + 5 * 60_000;
  const signal = AbortSignal.timeout(5 * 60_000);
  let lastFailure = "deployment marker not checked";
  while (Date.now() < deadline) {
    try {
      await probeDeployment(origin, expectedCommit, signal);
      console.log(
        `Production documentation matches commit ${expectedCommit} and its home modules are available.`,
      );
      process.exit(0);
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }
    console.log(`Waiting for deployment: ${lastFailure}`);
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise((resolve) => setTimeout(resolve, Math.min(5_000, remaining)));
  }
  throw new Error(`Timed out waiting for ${expectedCommit}: ${lastFailure}`);
}
