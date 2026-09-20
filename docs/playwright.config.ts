import { defineConfig } from "@playwright/test";

const baseURL = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "cross-browser.spec.ts",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  timeout: 45000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "on",
  },
  projects: [
    {
      name: "desktop-light",
      use: {
        viewport: { width: 1440, height: 900 },
        colorScheme: "light",
        video: { mode: "retain-on-failure", size: { width: 1440, height: 900 } },
      },
    },
    {
      name: "mobile-dark",
      use: {
        viewport: { width: 390, height: 844 },
        colorScheme: "dark",
        isMobile: true,
        hasTouch: true,
        video: { mode: "retain-on-failure", size: { width: 390, height: 844 } },
      },
    },
  ],
  webServer: process.env.DOCS_TEST_URL
    ? undefined
    : {
        command: "npm run start -- --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
