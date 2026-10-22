import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const output = new URL("../../registry/public/r/", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("registry.json", output), "utf8")) as {
  items: { name: string }[];
};

test("the local documentation serves the complete generated registry", async ({ request }) => {
  for (const name of ["registry", ...catalog.items.map((item) => item.name)]) {
    const response = await request.get(`/r/${name}.json`);
    expect(response.status(), name).toBe(200);
    expect(response.headers()["content-type"], name).toMatch(/application\/json/i);
    expect(await response.json(), name).toEqual(
      JSON.parse(readFileSync(new URL(`${name}.json`, output), "utf8")),
    );
  }
});
