import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openReady(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.ok()).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator(".special-page-loading")).toHaveCount(0);
}

test("project pages describe the product and retain the license link", async ({ page }) => {
  for (const route of ["/docs", "/docs/credits", "/docs/resources"]) {
    await openReady(page, route);
    await expect(page.getByRole("heading", { name: "Project background" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Upstream project" })).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/ekmas|Samuel Breznjak/);
    if (route === "/docs/credits") {
      await expect(page.getByRole("heading", { name: /Maintenance$/, level: 2 })).toBeVisible();
      await expect(page.getByRole("link", { name: "MIT License", exact: true })).toHaveAttribute(
        "href",
        "https://github.com/andongmin94/neobrutal-ui/blob/main/LICENSE",
      );
    }
  }
});

test("CMS saves body edits, previews plain text, and restores the saved version", async ({
  page,
}) => {
  await openReady(page, "/templates/cms");
  const title = page.getByRole("textbox", { name: "Title", exact: true });
  const body = page.getByRole("textbox", { name: "Content", exact: true });
  await body.fill("First paragraph.\n\n<script>not executable</script>");
  await page.getByText("Read preview", { exact: true }).click();
  await expect(page.getByRole("article", { name: "Post preview" })).toContainText(
    "<script>not executable</script>",
  );
  await expect(page.getByRole("article", { name: "Post preview" }).locator("script")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await body.fill("An unsaved replacement.");
  await title.fill("A changed title");
  await page.getByRole("button", { name: "Discard", exact: true }).click();
  await expect(title).toHaveValue("July product update");
  await expect(body).toHaveValue("First paragraph.\n\n<script>not executable</script>");
  await expect(title).toBeFocused();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await expect(page.locator(".special-content")).toContainText(
    "Restored the last locally saved version.",
  );
});

test("blog combines topic search and sorting and recovers from an empty intersection", async ({
  page,
}) => {
  await openReady(page, "/templates/blog");
  const topics = page.getByRole("group", { name: "Filter posts by topic" });
  await topics.getByRole("button", { name: "Engineering", exact: true }).click();
  await expect(topics.getByRole("button", { name: "Engineering", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("combobox", { name: "Sort posts", exact: true }).selectOption("oldest");
  const dates = await page
    .locator("#posts time")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime")));
  expect(dates.length).toBeGreaterThan(0);
  expect(dates).toEqual([...dates].sort());
  await page.getByRole("searchbox", { name: "Search posts" }).fill("no-matching-topic-or-post");
  await page.getByRole("button", { name: "Reset filters", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Search posts" })).toHaveValue("");
  await expect(page.getByRole("searchbox", { name: "Search posts" })).toBeFocused();
  await expect(page.locator("#posts article")).toHaveCount(6);
});

test("portfolio case studies disclose the problem, process, deliverables, and outcome", async ({
  page,
}) => {
  await openReady(page, "/templates/portfolio");
  const caseStudy = page.locator(".special-content details").first();
  await caseStudy.locator("summary").click();
  for (const label of ["The challenge", "The approach", "Delivered", "The outcome"]) {
    await expect(caseStudy.locator("dt", { hasText: label })).toBeVisible();
  }
});

test("link categories filter real destinations and clipboard failure remains actionable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    });
  });
  await openReady(page, "/templates/links");
  await page
    .getByRole("group", { name: "Filter links" })
    .getByRole("button", { name: "Work", exact: true })
    .click();
  await expect(page.locator(".special-content main ul a")).toHaveCount(2);
  await page
    .getByRole("group", { name: "Filter links" })
    .getByRole("button", { name: "All", exact: true })
    .click();
  await expect(page.locator(".special-content main ul a")).toHaveCount(6);
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("region", { name: "Contact", exact: true })).toContainText(
    "Could not copy.",
  );
});

test("chart summaries and tables follow their controls without losing units", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openReady(page, "/charts");
  const revenue = page.locator('[data-chart-recipe="revenue"]');
  await expect(revenue).toContainText("$74,300");
  await revenue.getByText("View revenue data", { exact: true }).click();
  await expect(revenue.locator("tbody tr")).toHaveCount(4);
  await revenue.getByRole("combobox", { name: "Revenue period", exact: true }).click();
  await page.getByRole("option", { name: "All 8 weeks", exact: true }).click();
  await expect(revenue.locator("tbody tr")).toHaveCount(8);
  await expect(revenue).toContainText("$132,800");
  await expect(revenue.getByRole("status")).toContainText("107.1%");
  const conversion = page.locator('[data-chart-recipe="conversion"]');
  await conversion.getByRole("combobox", { name: "Acquisition cohort", exact: true }).click();
  await page.getByRole("option", { name: "Sales-led", exact: true }).click();
  await expect(conversion).toContainText("29.4%");
  await conversion.getByText("View conversion data", { exact: true }).click();
  await expect(conversion.locator("tbody tr").last()).toContainText("470");
  const latency = page.locator('[data-chart-recipe="latency"]');
  await expect(latency).toContainText("470 ms");
  await latency.getByRole("combobox", { name: "Service", exact: true }).click();
  await page.getByRole("option", { name: "Search", exact: true }).click();
  await expect(latency).toContainText("310 ms");
  await expect(latency.getByRole("status")).toContainText("Wed");
  await latency.getByText("View latency data", { exact: true }).click();
  await expect(latency.locator("tbody tr")).toHaveCount(7);
  const strokes = await latency
    .locator(".recharts-line-curve")
    .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).stroke));
  expect(new Set(strokes).size).toBe(2);
  for (const recipe of [revenue, conversion, latency]) {
    const foreground = await recipe.evaluate((node) => getComputedStyle(node).color);
    const ticks = recipe.locator(".recharts-cartesian-axis-tick-value");
    expect(await ticks.count()).toBeGreaterThan(0);
    for (const tick of await ticks.all()) await expect(tick).toHaveCSS("fill", foreground);
  }
  expect(errors).toEqual([]);
});

test("analytical recipes reflow at 320px and pass automated accessibility checks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await openReady(page, "/charts");
  for (const summary of await page.locator("[data-chart-recipe] summary").all())
    await summary.click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  const results = await new AxeBuilder({ page })
    .include("section#examples")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, nodes }))).toEqual([]);
});
