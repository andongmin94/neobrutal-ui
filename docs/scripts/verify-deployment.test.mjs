import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { probeDeployment } from "./verify-deployment.mjs";

const commit = "a".repeat(40);
const home =
  '<script type="module" src="/assets/client.js"></script><link rel="modulepreload" href="/assets/shared.js">';

async function fixture(t, overrides = {}) {
  const requests = [];
  const methods = [];
  let active = 0;
  let maxActive = 0;
  const routes = {
    "/build-info.json": [200, "application/json", JSON.stringify({ commit })],
    "/": [200, "text/html; charset=utf-8", home],
    "/assets/client.js": [200, "text/javascript; charset=utf-8", "export {};"],
    "/assets/shared.js": [200, "application/javascript", "export {};"],
    ...overrides,
  };
  const server = createServer((request, response) => {
    requests.push(request.url);
    methods.push({ url: request.url, method: request.method });
    active += 1;
    maxActive = Math.max(maxActive, active);
    const [status, type, body, delay = 0] = routes[request.url] ?? [404, "text/plain", "not found"];
    setTimeout(() => {
      response.writeHead(status, { "Content-Type": type });
      response.end(body);
      active -= 1;
    }, delay);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    server,
    requests,
    methods,
    maxActive: () => maxActive,
  };
}

test("a different deployment SHA cannot report ready or fetch the home graph", async (t) => {
  const site = await fixture(t, {
    "/build-info.json": [200, "application/json", JSON.stringify({ commit: "b".repeat(40) })],
  });
  await assert.rejects(probeDeployment(site.origin, commit), /production reports/);
  assert.deepEqual(site.requests, ["/build-info.json"]);
});

test("a matching deployment marker cannot hide a missing home", async (t) => {
  const site = await fixture(t, { "/": [404, "text/html", "<h1>Not found</h1>"] });
  await assert.rejects(probeDeployment(site.origin, commit), /\/ must return 200/);
  assert.deepEqual(site.requests, ["/build-info.json", "/"]);
});

test("a missing modulepreload blocks readiness", async (t) => {
  const site = await fixture(t, { "/assets/shared.js": [404, "text/html", "not found"] });
  await assert.rejects(probeDeployment(site.origin, commit), /shared\.js must return 200/);
});

test("HTML returned with 200 at a JavaScript URL blocks readiness", async (t) => {
  const site = await fixture(t, { "/assets/shared.js": [200, "text/html", "not JavaScript"] });
  await assert.rejects(probeDeployment(site.origin, commit), /shared\.js must return JavaScript/);
});

test("a non-HTML home and an HTML home without local module assets block readiness", async (t) => {
  for (const [type, body] of [
    ["application/json", "{}"],
    ["text/html", "<h1>Not hydrated</h1>"],
  ]) {
    const site = await fixture(t, { "/": [200, type, body] });
    await assert.rejects(probeDeployment(site.origin, commit));
    assert.deepEqual(site.requests, ["/build-info.json", "/"]);
  }
});

test("available modules report ready with unique local assets and at most four requests at once", async (t) => {
  const modules = Array.from({ length: 7 }, (_, index) => `/assets/module-${index}.js`);
  const html = `${home}<LINK REL='modulepreload' HREF='/assets/shared.js'>${modules.map((url) => `<link rel=modulepreload href=${url}>`).join("")}
    <script type="module" src="https://example.com/assets/external.js"></script>
    <script type="module" src="/assets/../outside.js"></script>
    <script src="/assets/classic.js"></script>
    <link rel="stylesheet" href="/assets/style.css">
    <!-- <script type="module" src="/assets/comment.js"></script> -->
    <script>const ignored = '<link rel="modulepreload" href="/assets/inline-string.js">';</script>`;
  const site = await fixture(t, {
    "/": [200, "text/html", html],
    ...Object.fromEntries(modules.map((url) => [url, [200, "text/javascript", "export {};", 20]])),
  });
  await probeDeployment(site.origin, commit);
  assert.deepEqual(
    [...site.requests].sort(),
    ["/build-info.json", "/", "/assets/client.js", "/assets/shared.js", ...modules].sort(),
  );
  assert.ok(site.maxActive() <= 4, `observed ${site.maxActive()} parallel requests`);
  assert.ok(site.maxActive() > 1, "the module batch should execute concurrently");
  assert.ok(
    site.methods
      .filter((request) => request.url.startsWith("/assets/"))
      .every((request) => request.method === "HEAD"),
  );
});

test(
  "the shared deployment deadline aborts in-flight module requests",
  { timeout: 5_000 },
  async (t) => {
    const site = await fixture(t, {
      "/assets/shared.js": [200, "text/javascript", "export {};", 200],
    });
    const controller = new AbortController();
    const requested = new Promise((resolve) =>
      site.server.on("request", (request) => {
        if (request.url === "/assets/shared.js") resolve();
      }),
    );
    const checking = probeDeployment(site.origin, commit, controller.signal);
    await requested;
    controller.abort(new Error("deployment deadline reached"));
    await assert.rejects(checking, /deployment deadline reached/);
    assert.ok(site.requests.includes("/assets/shared.js"));
  },
);
