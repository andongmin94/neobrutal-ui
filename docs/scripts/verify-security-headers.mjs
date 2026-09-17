const baseURL = new URL(process.env.DOCS_TEST_URL ?? "https://neobrutal-ui.andongmin.com");
const response = await fetch(baseURL, { redirect: "follow" });

if (!response.ok) {
  throw new Error(`Documentation request failed: ${response.status} ${response.statusText}`);
}

const expectedHeaders = {
  "content-security-policy": [
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ],
  "cross-origin-opener-policy": ["same-origin"],
  "cross-origin-resource-policy": ["cross-origin"],
  "origin-agent-cluster": ["?1"],
  "permissions-policy": ["camera=()", "microphone=()", "geolocation=()"],
  "referrer-policy": ["strict-origin-when-cross-origin"],
  "strict-transport-security": ["max-age=63072000", "includeSubDomains"],
  "x-content-type-options": ["nosniff"],
  "x-frame-options": ["DENY"],
  "x-permitted-cross-domain-policies": ["none"],
};

for (const [name, expectedValues] of Object.entries(expectedHeaders)) {
  const actual = response.headers.get(name);
  if (!actual) throw new Error(`Missing security header: ${name}`);
  for (const expected of expectedValues) {
    if (!actual.includes(expected)) {
      throw new Error(`${name} does not include ${expected}: ${actual}`);
    }
  }
}

const html = await response.text();
const assetPath = html.match(/(?:src|href)="([^"]*\/assets\/[^"]+)"/)?.[1];
if (!assetPath) throw new Error("Could not find a built asset in the deployed document.");

const assetResponse = await fetch(new URL(assetPath, baseURL), { redirect: "follow" });
if (!assetResponse.ok) {
  throw new Error(`Asset request failed: ${assetResponse.status} ${assetResponse.statusText}`);
}

const cacheControl = assetResponse.headers.get("cache-control") ?? "";
for (const directive of ["max-age=31536000", "immutable"]) {
  if (!cacheControl.includes(directive)) {
    throw new Error(`Asset cache-control does not include ${directive}: ${cacheControl}`);
  }
}

console.log(`Security headers and immutable asset caching verified at ${baseURL.origin}.`);
