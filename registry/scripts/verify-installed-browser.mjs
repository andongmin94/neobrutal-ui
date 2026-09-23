import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { verifyInstalledInteractions } from "./verify-installed-interactions.mjs";
import { verifyServerInputGroup } from "./verify-server-input-group.mjs";

export async function verifyInstalledBrowser({ target, directory, scenario, root }) {
  const requireDocs = createRequire(path.join(root, "../docs/package.json"));
  const { chromium, firefox, webkit, expect } = requireDocs("@playwright/test");
  const { default: AxeBuilder } = requireDocs("@axe-core/playwright");
  const reportDirectory = path.join(
    root,
    "../docs/test-results/installed-consumers",
    `${target}-${scenario}`,
  );
  fs.mkdirSync(reportDirectory, { recursive: true });
  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  const executable = path.join(directory, "node_modules/.bin", target === "next" ? "next" : "vite");
  const args =
    target === "next"
      ? ["start", "--hostname", "127.0.0.1", "--port", String(port)]
      : ["preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"];
  const child = spawn(executable, args, {
    cwd: directory,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "pipe",
  });
  let log = "";
  let spawnError;
  child.on("error", (error) => {
    spawnError = error;
  });
  child.stdout.on("data", (chunk) => {
    log += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    log += chunk.toString();
  });
  const records = [];

  try {
    for (let attempt = 0; ; attempt++) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null) throw new Error(`Consumer server exited: ${log}`);
      try {
        const response = await fetch(origin, { signal: AbortSignal.timeout(2000) });
        if (response.ok) break;
      } catch {
        // The fixture server is still starting.
      }
      if (attempt >= 60) throw new Error(`Consumer server did not start: ${log}`);
      await delay(500);
    }
    for (const [engine, browserType] of [
      ["chromium", chromium],
      ["firefox", firefox],
      ["webkit", webkit],
    ]) {
      const browser = await browserType.launch();
      try {
        for (const { width, theme } of [
          { width: 1440, theme: "light" },
          { width: 390, theme: "dark" },
        ]) {
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            colorScheme: theme,
            reducedMotion: "reduce",
          });
          await context.addInitScript((dark) => {
            document.addEventListener("DOMContentLoaded", () => {
              document.documentElement.classList.toggle("dark", dark);
            });
          }, theme === "dark");
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          try {
            await page.goto(origin);
            const button = page.getByRole("button", { name: "Click me", exact: true });
            await expect(button).toBeVisible();
            await expect(button).toHaveCSS("border-top-width", "2px");
            assert.notEqual(
              await button.evaluate((node) => getComputedStyle(node).boxShadow),
              "none",
            );
            if (scenario === "existing") {
              await expect(page.locator(".consumer-sentinel")).toHaveCSS("border-top-width", "7px");
              await expect(button).toHaveCSS("border-radius", "13px");
              const palette = ["red", "yellow"].map((name) => {
                const item = JSON.parse(
                  fs.readFileSync(path.join(root, `public/r/theme-${name}.json`), "utf8"),
                );
                return item.cssVars[theme].main;
              });
              await assertThemeColor(button, palette, expect);
              await verifyInstalledInteractions({ page, expect, reportDirectory, engine, theme });
              records.push({ engine, width, theme, route: "/#interactions", passed: true });
              const revenue = page.locator('[data-chart-recipe="revenue"]');
              await expect(revenue).toContainText("$74,300");
              await revenue.getByLabel("Revenue period").click();
              await page.getByRole("option", { name: "All 8 weeks", exact: true }).click();
              await expect(revenue).toContainText("$132,800");
              await revenue.getByText("View revenue data", { exact: true }).click();
              await expect(revenue.locator("tbody tr")).toHaveCount(8);
              const latency = page.locator('[data-chart-recipe="latency"]');
              await latency.getByRole("combobox", { name: "Service", exact: true }).click();
              await page.getByRole("option", { name: "Search", exact: true }).click();
              await expect(latency).toContainText("310 ms");
              const recordsPane = page.getByRole("region", { name: "Records", exact: true });
              await recordsPane.getByLabel("Filter email records").fill("ken99");
              await expect(recordsPane.locator("tbody tr")).toHaveCount(1);
              await recordsPane.getByLabel("Filter email records").fill("");
              await expect(recordsPane.locator("tbody tr")).toHaveCount(5);
              for (const chart of await page.locator("[data-chart-recipe]").all()) {
                await expect(chart.locator(".recharts-surface")).toBeVisible();
                if ((await chart.locator("details").getAttribute("open")) === null) {
                  await chart.locator("summary").click();
                }
                await expect(chart.locator("tbody tr")).not.toHaveCount(0);
                if (engine === "chromium") {
                  const kind = await chart.getAttribute("data-chart-recipe");
                  await chart.screenshot({
                    path: path.join(reportDirectory, `${engine}-${width}-${theme}-${kind}.png`),
                  });
                }
              }
            }
            await assertPage(page, expect, AxeBuilder, errors, width);
            await page.screenshot({
              path: path.join(reportDirectory, `${engine}-${width}-${theme}-charts.png`),
            });
            records.push({ engine, width, theme, route: "/", passed: true });

            if (scenario === "existing" && target === "next") {
              await verifyServerInputGroup({ page, origin, expect });
              await assertPage(page, expect, AxeBuilder, errors, width);
              await page.screenshot({
                path: path.join(
                  reportDirectory,
                  `${engine}-${width}-${theme}-server-input-group.png`,
                ),
              });
              records.push({ engine, width, theme, route: "/server-input-group", passed: true });
              for (const route of ["/blog", "/portfolio", "/cms", "/links"]) {
                await page.goto(`${origin}${route}`);
                await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
                if (route === "/blog") {
                  const search = page.getByRole("searchbox", { name: "Search posts" });
                  await search.fill("does-not-exist-한글-検索");
                  await expect(page.getByText("No posts found.", { exact: true })).toBeVisible();
                  await search.fill("");
                }
                if (route === "/cms") {
                  await page.getByRole("button", { name: "New post", exact: true }).click();
                  await page
                    .getByLabel("Title", { exact: true })
                    .fill("설치 검수 / 編集 / Working title");
                  await page
                    .getByLabel("Content", { exact: true })
                    .fill("Plain text <script>not executable</script>\n\nSecond paragraph.");
                  await page.getByText("Read preview", { exact: true }).click();
                  await expect(page.getByRole("article", { name: "Post preview" })).toContainText(
                    "<script>not executable</script>",
                  );
                  await page.getByRole("button", { name: "Save", exact: true }).click();
                  await expect(
                    page.getByRole("button", { name: "Save", exact: true }),
                  ).toBeDisabled();
                  await page.getByLabel("Title", { exact: true }).fill("Temporary change");
                  await page.getByRole("button", { name: "Discard", exact: true }).click();
                  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
                    "설치 검수 / 編集 / Working title",
                  );
                }
                if (route === "/portfolio") {
                  const summary = page.locator("details summary").first();
                  await summary.click();
                  await expect(summary.locator("..")).toHaveAttribute("open", "");
                }
                await assertPage(page, expect, AxeBuilder, errors, width);
                await page.evaluate(() => window.scrollTo(0, 0));
                await page.screenshot({
                  path: path.join(
                    reportDirectory,
                    `${engine}-${width}-${theme}-${route.slice(1)}.png`,
                  ),
                });
                records.push({ engine, width, theme, route, passed: true });
              }
            }
          } catch (error) {
            records.push({
              engine,
              width,
              theme,
              route: page.url(),
              passed: false,
              error: String(error),
            });
            await page
              .screenshot({
                path: path.join(reportDirectory, `${engine}-${width}-${theme}-failed.png`),
              })
              .catch(() => {});
            throw error;
          } finally {
            await context.close();
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    child.kill("SIGTERM");
    fs.writeFileSync(
      path.join(reportDirectory, "report.json"),
      `${JSON.stringify(records, null, 2)}\n`,
    );
    fs.writeFileSync(path.join(reportDirectory, "server.log"), log);
  }
  console.log(`Installed ${target}/${scenario}: ${records.length} rendered checks passed.`);
}

async function assertThemeColor(button, palette, expect) {
  const pixels = await button.evaluate((node, references) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { colorSpace: "srgb" });
    if (!context) throw new Error("Cannot compare rendered theme colors");
    const token = getComputedStyle(document.documentElement).getPropertyValue("--main").trim();
    // CSS optimization may serialize OKLCH as Lab. Compare the rendered
    // token and button to the selected palette, not their notation strings.
    return [token, getComputedStyle(node).backgroundColor, ...references].map((color) => {
      if (!CSS.supports("color", color)) throw new Error(`Invalid theme color: ${color}`);
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    });
  }, palette);
  for (const actual of pixels.slice(0, 2)) {
    expect(actual[3], "theme colors must preserve opacity").toBe(pixels[2][3]);
    for (let channel = 0; channel < 3; channel++) {
      // Color-space conversion can round a channel by one 8-bit step.
      expect(Math.abs(actual[channel] - pixels[2][channel])).toBeLessThanOrEqual(1);
    }
  }
  expect(pixels[0], "the base yellow must not replace the selected red").not.toEqual(pixels[3]);
}

async function assertPage(page, expect, AxeBuilder, errors, width) {
  expect(errors).toEqual([]);
  const scheme = await page.evaluate(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  await expect(page.locator("html")).toHaveCSS("color-scheme", scheme);
  for (const select of await page.locator("select").all()) {
    await expect(select).toHaveCSS("color-scheme", scheme);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    width + 1,
  );
  expect(
    await page
      .locator('link[rel="stylesheet"]')
      .evaluateAll((links) => links.every((link) => new URL(link.href).origin === location.origin)),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

async function availablePort() {
  const server = http.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Could not allocate a consumer port");
  await new Promise((resolve) => server.close(resolve));
  return address.port;
}
