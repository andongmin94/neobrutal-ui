import { defineConfig } from "@playwright/test";

const baseURL = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/smoke",
  workers: 1,
  retries: 0,
  timeout: 45000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-smoke" }]],
  use: {
    baseURL,
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    storageState: {
      cookies: [],
      origins: [
        {
          origin: new URL(baseURL).origin,
          localStorage: [
            {
              name: "neobrutal-ui-github-stars",
              value: JSON.stringify({ count: 10_000, fetchedAt: Date.now() }),
            },
          ],
        },
      ],
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.DOCS_TEST_URL
    ? undefined
    : {
        command: "npm run start -- --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
