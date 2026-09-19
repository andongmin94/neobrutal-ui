import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDirectory = path.join(root, "public", "r");
const catalog = readJson(path.join(outputDirectory, "registry.json"));
const { values: options, positionals: requestedTargets } = parseArgs({
  allowPositionals: true,
  options: {
    item: { type: "string" },
    "registry-url": { type: "string" },
    integration: { type: "boolean", default: false },
  },
});
if (
  options.item &&
  !catalog.items.some(
    (item) =>
      item.name === options.item && item.type !== "registry:base" && item.type !== "registry:style",
  )
) {
  throw new Error(`Unknown installable item: ${options.item}`);
}
if (options.integration && options.item) {
  throw new Error("Integration verification selects its own installation scenarios.");
}
const targets = requestedTargets.length > 0 ? requestedTargets : ["next", "vite"];
const supportedTargets = new Set(["next", "vite"]);

for (const target of targets) {
  if (!supportedTargets.has(target)) throw new Error(`Unknown consumer target: ${target}`);
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-registry-consumer-"));
let registryOrigin = options["registry-url"]?.replace(/\/$/, "") ?? "";
const server = http.createServer(serveRegistryFile);

try {
  if (!registryOrigin) {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Could not start registry server");
    registryOrigin = `http://127.0.0.1:${address.port}`;
  } else if (!["https:", "http:"].includes(new URL(registryOrigin).protocol)) {
    throw new Error("Registry URL must use HTTP or HTTPS");
  }

  for (const target of targets) {
    for (const scenario of options.integration ? ["readme", "existing"] : ["standard"]) {
      await verifyTarget(target, path.join(temporaryRoot, `${target}-${scenario}`), scenario);
    }
  }
} finally {
  if (server.listening) await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temporaryRoot, { force: true, recursive: true });
}

async function verifyTarget(target, fixtureDirectory, scenario) {
  fs.mkdirSync(fixtureDirectory, { recursive: true });
  if (target === "next") createNextFixture(fixtureDirectory);
  else createViteFixture(fixtureDirectory);

  const configPath = path.join(fixtureDirectory, "components.json");
  if (scenario === "existing") {
    const config = readJson(configPath);
    config.aliases = {
      components: "@/design-system",
      ui: "@/design-system/ui",
      lib: "@/shared",
      utils: "@/shared/utils",
      hooks: "@/shared/hooks",
    };
    writeJson(configPath, config);
  }

  console.log(`Installing ${target}/${scenario} fixture dependencies...`);
  await run(npmExecutable(), ["install", "--no-audit", "--no-fund"], fixtureDirectory);

  if (scenario === "readme") {
    fs.rmSync(configPath);
    await run(
      npmExecutable(),
      [
        "exec", "--yes", "--package=shadcn@latest", "--", "shadcn", "init",
        "--defaults", "--template", target, "--base", "base", "--no-monorepo",
        "--cwd", fixtureDirectory,
      ],
      fixtureDirectory,
    );
    assert.ok(fs.existsSync(configPath), "shadcn init must create components.json");
  }

  const initialConfig = readJson(configPath);
  const cssPath = path.join(fixtureDirectory, initialConfig.tailwind.css);
  const sentinelPath = path.join(fixtureDirectory, "src", "consumer-owned.ts");
  const sentinel = 'export const consumerOwned = "keep this application code";\n';
  if (scenario === "existing") {
    writeFile(sentinelPath, sentinel);
    fs.appendFileSync(cssPath, "\n.consumer-sentinel { border-top: 7px solid currentColor; }\n");
  }

  const baseItem = catalog.items.find((item) => item.type === "registry:base");
  if (!baseItem) throw new Error("The registry has no registry:base item");
  const overwrite = scenario === "standard" ? ["--overwrite"] : [];
  const add = async (...names) => {
    const args = ["add", "--yes", ...overwrite, "--cwd", fixtureDirectory, ...names.map(itemUrl)];
    if (scenario === "readme") {
      await run(
        npmExecutable(),
        ["exec", "--yes", "--package=shadcn@latest", "--", "shadcn", ...args],
        fixtureDirectory,
      );
    } else {
      await run(shadcnExecutable(), args, root);
    }
  };
  await add(baseItem.name);

  if (scenario !== "readme") await add("theme-red");
  if (scenario === "existing") {
    fs.appendFileSync(cssPath, "\n:root { --radius: 13px; }\n");
    assert.deepEqual(
      readJson(configPath).aliases,
      initialConfig.aliases,
      "base installation reset custom aliases",
    );
  }
  const cssBeforeItems = fs.readFileSync(cssPath, "utf8");

  const installableItems = catalog.items.filter((item) => {
    if (item.name === baseItem.name || item.type === "registry:style") return false;
    if (scenario === "readme") return item.name === "button";
    if (scenario === "existing") {
      return (
        ["button", "data-table"].includes(item.name) ||
        (item.name.startsWith("chart-") && item.categories?.includes("recipe")) ||
        (target === "next" && item.categories?.includes("template"))
      );
    }
    if (options.item && item.name !== options.item) return false;
    if (target === "next") return true;
    return (
      item.type === "registry:ui" ||
      item.type === "registry:component" ||
      item.name === "data-table"
    );
  });
  if (installableItems.length === 0) throw new Error(`No selected items support ${target}`);
  await add(...installableItems.map((item) => item.name));

  if (scenario === "existing") {
    assert.equal(
      fs.readFileSync(cssPath, "utf8"),
      cssBeforeItems,
      "adding recipes or templates changed the selected theme or custom CSS",
    );
    assert.equal(fs.readFileSync(sentinelPath, "utf8"), sentinel, "consumer-owned source changed");
    assert.deepEqual(readJson(configPath).aliases, initialConfig.aliases);
    for (const item of installableItems) {
      for (const file of item.files ?? []) {
        if (file.type === "registry:page") continue;
        const targetPath = file.target
          ? file.target.replace(
              /^@(components|ui|lib|hooks)\//,
              (_, alias) => `${initialConfig.aliases[alias].replace(/^@\//, "src/")}/`,
            )
          : `${initialConfig.aliases.ui.replace(/^@\//, "src/")}/${path.basename(file.path)}`;
        assert.ok(
          fs.existsSync(path.join(fixtureDirectory, targetPath)),
          `missing custom-alias target: ${targetPath}`,
        );
      }
    }
    assert.ok(
      !fs.existsSync(path.join(fixtureDirectory, "src/components")),
      "installation leaked into the default components path",
    );
  }

  if (scenario === "standard") {
    if (target === "vite") createViteBundleEntry(fixtureDirectory);
  } else {
    writeBrowserEntry(target, fixtureDirectory, readJson(configPath).aliases, scenario, installableItems);
  }
  console.log(`Building the fresh ${target}/${scenario} consumer...`);
  await run(npmExecutable(), ["run", "build"], fixtureDirectory, { NEXT_TELEMETRY_DISABLED: "1" });
  if (scenario !== "standard") {
    const { verifyInstalledBrowser } = await import("./verify-installed-browser.mjs");
    await verifyInstalledBrowser({ target, directory: fixtureDirectory, scenario, root });
  }
  console.log(`Fresh ${target}/${scenario} consumer passed: ${options.item ?? "selected items"}.`);
}

function writeBrowserEntry(target, directory, aliases, scenario, items) {
  const charts = scenario === "existing" ? items.filter((item) => item.name.startsWith("chart-")) : [];
  const source = [
    '"use client";',
    `import { Button } from "${aliases.ui}/button";`,
    ...(scenario === "existing" ? [`import DataTable from "${aliases.ui}/data-table";`] : []),
    ...charts.map((item, index) => `import Chart${index} from "${aliases.ui}/${item.name}";`),
    "export default function Page() {",
    '  return <main className="mx-auto grid w-full max-w-5xl gap-8 p-6">',
    '    <h1 className="text-2xl font-heading">Installed consumer</h1>',
    '    <Button>Click me</Button>',
    '    <p className="consumer-sentinel">Existing application styles</p>',
    ...charts.map((item, index) => `    <section aria-label="${item.name}"><Chart${index} /></section>`),
    ...(scenario === "existing" ? ['    <section aria-label="Records"><DataTable /></section>'] : []),
    "  </main>;",
    "}",
  ].join("\n");
  const entry = target === "next" ? ["app", "page.tsx"] : ["App.tsx"];
  writeFile(path.join(directory, "src", ...entry), `${source}\n`);
}

function createNextFixture(directory) {
  writeJson(path.join(directory, "package.json"), {
    name: "neobrutal-registry-next-consumer",
    private: true,
    scripts: { build: "next build" },
    dependencies: { next: "^16.3.5", react: "19.2.8", "react-dom": "19.2.8" },
    devDependencies: {
      "@tailwindcss/postcss": "^4.3.3",
      "@types/node": "^26.1.1",
      "@types/react": "^19.2.17",
      "@types/react-dom": "^19.2.3",
      tailwindcss: "^4.3.3",
      typescript: "^7.0.2",
    },
  });
  const config = componentsConfig(true);
  config.tailwind.css = "src/app/globals.css";
  writeJson(path.join(directory, "components.json"), config);
  writeJson(path.join(directory, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./src/*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  });
  writeFile(path.join(directory, "next-env.d.ts"), '/// <reference types="next" />\n');
  writeFile(path.join(directory, "next.config.mjs"), "export default {};\n");
  writeFile(
    path.join(directory, "postcss.config.mjs"),
    'export default { plugins: { "@tailwindcss/postcss": {} } };\n',
  );
  writeFile(path.join(directory, "src", "app", "globals.css"), '@import "tailwindcss";\n');
  writeFile(
    path.join(directory, "src", "app", "layout.tsx"),
    'import "./globals.css";\nexport default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }\n',
  );
  writeFile(
    path.join(directory, "src", "app", "page.tsx"),
    "export default function Page() { return <main>Registry consumer</main>; }\n",
  );
}

function createViteFixture(directory) {
  writeJson(path.join(directory, "package.json"), {
    name: "neobrutal-registry-vite-consumer",
    private: true,
    type: "module",
    scripts: { build: "tsc --noEmit && vite build" },
    dependencies: { react: "19.2.8", "react-dom": "19.2.8" },
    devDependencies: {
      "@tailwindcss/vite": "^4.3.3",
      "@types/react": "^19.2.17",
      "@types/react-dom": "^19.2.3",
      "@vitejs/plugin-react": "^6.0.1",
      tailwindcss: "^4.3.3",
      typescript: "^7.0.2",
      vite: "^8.3.0",
    },
  });
  writeJson(path.join(directory, "components.json"), componentsConfig(false));
  writeJson(path.join(directory, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2022",
      useDefineForClassFields: true,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      allowJs: false,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: "ESNext",
      moduleResolution: "Bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      types: ["vite/client"],
      paths: { "@/*": ["./src/*"] },
    },
    include: ["src"],
  });
  writeFile(
    path.join(directory, "index.html"),
    '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
  );
  writeFile(
    path.join(directory, "vite.config.ts"),
    'import path from "node:path";\nimport tailwindcss from "@tailwindcss/vite";\nimport react from "@vitejs/plugin-react";\nimport { defineConfig } from "vite";\nexport default defineConfig({ plugins: [react(), tailwindcss()], resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } } });\n',
  );
  writeFile(path.join(directory, "src", "index.css"), '@import "tailwindcss";\n');
  writeFile(
    path.join(directory, "src", "main.tsx"),
    'import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\ncreateRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);\n',
  );
  writeFile(
    path.join(directory, "src", "App.tsx"),
    "export default function App() { return <main>Registry consumer</main>; }\n",
  );
}

function createViteBundleEntry(directory) {
  const componentFiles = collectFiles(path.join(directory, "src", "components")).filter((file) =>
    /\.[cm]?[jt]sx?$/.test(file),
  );
  if (componentFiles.length === 0) {
    throw new Error("The Vite consumer did not install any component modules");
  }
  const imports = componentFiles
    .sort()
    .map((file) => {
      const modulePath = path
        .relative(path.join(directory, "src"), file)
        .replaceAll("\\", "/")
        .replace(/\.[cm]?[jt]sx?$/, "");
      return `import "./${modulePath}";`;
    })
    .join("\n");
  writeFile(path.join(directory, "src", "registry-smoke.ts"), `${imports}\n`);
  writeFile(
    path.join(directory, "src", "App.tsx"),
    'import "./registry-smoke";\nexport default function App() { return <main>Registry consumer</main>; }\n',
  );
}

function collectFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  });
}

function componentsConfig(rsc) {
  return {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc,
    tsx: true,
    tailwind: {
      config: "",
      css: "src/index.css",
      baseColor: "neutral",
      cssVariables: true,
      prefix: "",
    },
    iconLibrary: "lucide",
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    registries: {},
  };
}

function serveRegistryFile(request, response) {
  const pathname = new URL(request.url ?? "/", registryOrigin || "http://127.0.0.1").pathname;
  const filePath = path.resolve(outputDirectory, pathname.replace(/^\/+/, ""));
  if (
    !filePath.startsWith(`${path.resolve(outputDirectory)}${path.sep}`) ||
    !fs.existsSync(filePath) ||
    !fs.statSync(filePath).isFile()
  ) {
    response.writeHead(404, { "content-type": "application/json" });
    response.end('{"message":"Registry item not found"}');
    return;
  }
  const content = fs
    .readFileSync(filePath, "utf8")
    .replaceAll(`${catalog.homepage}/r/`, `${registryOrigin}/`);
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(content);
}

function itemUrl(name) {
  return `${registryOrigin}/${name}.json`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function npmExecutable() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function shadcnExecutable() {
  const executable = process.platform === "win32" ? "shadcn.cmd" : "shadcn";
  return path.join(root, "node_modules", ".bin", executable);
}

function run(command, args, cwd, additionalEnvironment = {}) {
  return new Promise((resolve, reject) => {
    const spawnCommand =
      process.platform === "win32"
        ? [command, ...args].map(quoteCommandArgument).join(" ")
        : command;
    const child = spawn(spawnCommand, process.platform === "win32" ? [] : args, {
      cwd,
      env: { ...process.env, CI: "1", ...additionalEnvironment },
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(command)} exited with code ${code ?? "unknown"}`));
    });
  });
}

function quoteCommandArgument(value) {
  return /^[\w./:\\-]+$/.test(value) ? value : `"${value.replaceAll('"', '""')}"`;
}
