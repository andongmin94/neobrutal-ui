import { defineConfig } from "@playwright/test";

const baseURL = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  testMatch: [
    "cross-browser.spec.ts",
    "form-composition.spec.ts",
    "search-recovery.spec.ts",
    "release-controls.spec.ts",
    "template-navigation.spec.ts",
  ],
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  timeout: 45000,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report-cross" }],
  ],
  use: {
    baseURL,
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-reflow",
      use: {
        browserName: "chromium",
        viewport: { width: 320, height: 900 },
        colorScheme: "light",
        hasTouch: true,
        reducedMotion: "reduce",
      },
    },
    {
      name: "firefox-desktop",
      use: {
        browserName: "firefox",
        viewport: { width: 1440, height: 900 },
        colorScheme: "light",
      },
    },
    {
      name: "webkit-mobile",
      use: {
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        colorScheme: "dark",
        isMobile: true,
        hasTouch: true,
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
