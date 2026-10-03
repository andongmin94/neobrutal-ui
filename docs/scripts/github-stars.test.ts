import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";

const CACHE_KEY = "neobrutal-ui-github-stars";
const CACHE_TTL = 60 * 60 * 1000;
const NOW = 2_000_000_000_000;
let moduleId = 0;

async function loadStars() {
  const url = new URL("../src/site/lib/github-stars.ts", import.meta.url);
  url.searchParams.set("test", String(moduleId++));
  return (await import(url.href)) as {
    getGitHubStars: () => Promise<number | null>;
  };
}

function browser(t: TestContext, cached?: string) {
  const values = new Map<string, string>();
  if (cached !== undefined) values.set(CACHE_KEY, cached);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: storage },
  });
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  });
  let now = NOW;
  t.mock.method(Date, "now", () => now);
  return { values, storage, setNow: (value: number) => (now = value) };
}

function response(count: unknown) {
  return Response.json({ stargazers_count: count });
}

test("server rendering does not request GitHub stars", async (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Reflect.deleteProperty(globalThis, "window");
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  });
  const fetch = t.mock.method(globalThis, "fetch", async () => response(10_000));
  const { getGitHubStars } = await loadStars();

  assert.equal(await getGitHubStars(), null);
  assert.equal(fetch.mock.callCount(), 0);
});

test("successful browser requests persist the star count and reuse it for one hour", async (t) => {
  const env = browser(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => response(10_000));
  const { getGitHubStars } = await loadStars();

  assert.equal(await getGitHubStars(), 10_000);
  assert.equal(
    fetch.mock.calls[0].arguments[0],
    "https://api.github.com/repos/andongmin94/neobrutal-ui",
  );
  assert.deepEqual(JSON.parse(env.values.get(CACHE_KEY)!), { count: 10_000, fetchedAt: NOW });
  env.setNow(NOW + CACHE_TTL - 1);
  assert.equal(await getGitHubStars(), 10_000);
  assert.equal(fetch.mock.callCount(), 1);
});

test("a new page reuses persisted stars and refreshes at the one-hour boundary", async (t) => {
  const env = browser(t, JSON.stringify({ count: 1, fetchedAt: NOW }));
  const fetch = t.mock.method(globalThis, "fetch", async () => response(2));
  const { getGitHubStars } = await loadStars();

  env.setNow(NOW + CACHE_TTL - 1);
  assert.equal(await getGitHubStars(), 1);
  assert.equal(fetch.mock.callCount(), 0);
  env.setNow(NOW + CACHE_TTL);
  assert.equal(await getGitHubStars(), 2);
  assert.equal(fetch.mock.callCount(), 1);
  assert.deepEqual(JSON.parse(env.values.get(CACHE_KEY)!), {
    count: 2,
    fetchedAt: NOW + CACHE_TTL,
  });
});

test("concurrent callers share a request and can refresh after it settles", async (t) => {
  const env = browser(t);
  let resolveRequest!: (value: Response) => void;
  const pending = new Promise<Response>((resolve) => (resolveRequest = resolve));
  const fetch = t.mock.method(globalThis, "fetch", () => pending);
  const { getGitHubStars } = await loadStars();

  const first = getGitHubStars();
  const second = getGitHubStars();
  assert.equal(fetch.mock.callCount(), 1);
  resolveRequest(response(10_000));
  assert.deepEqual(await Promise.all([first, second]), [10_000, 10_000]);
  env.setNow(NOW + CACHE_TTL);
  assert.equal(await getGitHubStars(), 10_000);
  assert.equal(fetch.mock.callCount(), 2);
});

test("HTTP errors return a stale success without marking it fresh, then retry", async (t) => {
  const fetchedAt = NOW - CACHE_TTL;
  const env = browser(t, JSON.stringify({ count: 7, fetchedAt }));
  let available = false;
  const fetch = t.mock.method(globalThis, "fetch", async () =>
    available ? response(8) : new Response(null, { status: 403 }),
  );
  const { getGitHubStars } = await loadStars();

  assert.equal(await getGitHubStars(), 7);
  assert.deepEqual(JSON.parse(env.values.get(CACHE_KEY)!), { count: 7, fetchedAt });
  available = true;
  assert.equal(await getGitHubStars(), 8);
  assert.equal(fetch.mock.callCount(), 2);
});

test("network failure without a cached success stays unknown and permits a retry", async (t) => {
  const env = browser(t);
  let available = false;
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    if (!available) throw new TypeError("Network unavailable");
    return response(1);
  });
  const { getGitHubStars } = await loadStars();

  assert.equal(await getGitHubStars(), null);
  assert.equal(env.values.has(CACHE_KEY), false);
  available = true;
  assert.equal(await getGitHubStars(), 1);
  assert.equal(fetch.mock.callCount(), 2);
});

test("zero is a valid successful count and is cached", async (t) => {
  const env = browser(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => response(0));
  const { getGitHubStars } = await loadStars();

  assert.equal(await getGitHubStars(), 0);
  assert.equal(await getGitHubStars(), 0);
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(JSON.parse(env.values.get(CACHE_KEY)!).count, 0);
});

test("invalid GitHub data preserves the last success instead of becoming zero", async (t) => {
  browser(t, JSON.stringify({ count: 12, fetchedAt: NOW - CACHE_TTL }));
  const invalidResponses = [
    response(-1),
    response(1.5),
    response("13"),
    response(null),
    Response.json({ message: "API rate limit exceeded" }),
    new Response("invalid JSON"),
  ];
  const fetch = t.mock.method(globalThis, "fetch", async () => invalidResponses.shift()!);
  const { getGitHubStars } = await loadStars();

  for (let i = 0; i < 6; i++) assert.equal(await getGitHubStars(), 12);
  assert.equal(fetch.mock.callCount(), 6);
});

test("malformed or invalid persisted caches are ignored", async (t) => {
  const env = browser(t);
  const invalidCaches = [
    "invalid JSON",
    "null",
    JSON.stringify({ count: -1, fetchedAt: NOW }),
    JSON.stringify({ count: 1.5, fetchedAt: NOW }),
    JSON.stringify({ count: "1", fetchedAt: NOW }),
    JSON.stringify({ count: 1, fetchedAt: "today" }),
    JSON.stringify({ count: 1, fetchedAt: -1 }),
    JSON.stringify({ count: 1, fetchedAt: NOW + 1 }),
  ];
  const fetch = t.mock.method(globalThis, "fetch", async () => response(2));

  for (const cached of invalidCaches) {
    env.values.set(CACHE_KEY, cached);
    const { getGitHubStars } = await loadStars();
    assert.equal(await getGitHubStars(), 2);
  }
  assert.equal(fetch.mock.callCount(), invalidCaches.length);
});

test("inaccessible localStorage does not prevent requests or memory caching", async (t) => {
  const env = browser(t);
  Object.defineProperty(window, "localStorage", {
    get: () => {
      throw new Error("Storage unavailable");
    },
  });
  const fetch = t.mock.method(globalThis, "fetch", async () => response(10_000));
  const { getGitHubStars } = await loadStars();

  assert.equal(await getGitHubStars(), 10_000);
  env.setNow(NOW + CACHE_TTL - 1);
  assert.equal(await getGitHubStars(), 10_000);
  assert.equal(fetch.mock.callCount(), 1);
  env.setNow(NOW + CACHE_TTL);
  assert.equal(await getGitHubStars(), 10_000);
  assert.equal(fetch.mock.callCount(), 2);
});

test("storage write failure retains the last successful count in memory", async (t) => {
  const env = browser(t);
  t.mock.method(env.storage, "setItem", () => {
    throw new Error("Storage quota exceeded");
  });
  let available = true;
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    if (!available) throw new TypeError("Network unavailable");
    return response(10_000);
  });
  const { getGitHubStars } = await loadStars();

  assert.equal(await getGitHubStars(), 10_000);
  assert.equal(await getGitHubStars(), 10_000);
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(env.values.has(CACHE_KEY), false);
  env.setNow(NOW + CACHE_TTL);
  available = false;
  assert.equal(await getGitHubStars(), 10_000);
});
