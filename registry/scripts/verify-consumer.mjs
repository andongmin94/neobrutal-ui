import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDirectory = path.join(root, "public", "r");
const catalog = readJson(path.join(outputDirectory, "registry.json"));
const requestedTargets = process.argv.slice(2);
const targets = requestedTargets.length > 0 ? requestedTargets : ["next", "vite"];
const supportedTargets = new Set(["next", "vite"]);

for (const target of targets) {
  if (!supportedTargets.has(target)) {
    throw new Error(`Unknown consumer target: ${target}`);
  }
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-registry-consumer-"));
let registryOrigin = "";
const server = http.createServer(serveRegistryFile);

try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start registry server");
  registryOrigin = `http://127.0.0.1:${address.port}`;

  for (const target of targets) {
    await verifyTarget(target, path.join(temporaryRoot, target));
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temporaryRoot, { force: true, recursive: true });
}

async function verifyTarget(target, fixtureDirectory) {
  fs.mkdirSync(fixtureDirectory, { recursive: true });
  if (target === "next") createNextFixture(fixtureDirectory);
  else createViteFixture(fixtureDirectory);

  console.log(`Installing ${target} fixture dependencies...`);
  await run(npmExecutable(), ["install", "--no-audit", "--no-fund"], fixtureDirectory);

  const baseItem = catalog.items.find((item) => item.type === "registry:base");
  if (!baseItem) throw new Error("The registry has no registry:base item");

  await run(
    shadcnExecutable(),
    ["add", "--yes", "--overwrite", "--cwd", fixtureDirectory, itemUrl(baseItem.name)],
    root,
  );

  await run(
    shadcnExecutable(),
    ["add", "--yes", "--overwrite", "--cwd", fixtureDirectory, styleUrl("red")],
    root,
  );

  const installableItems = catalog.items.filter((item) => {
    if (item.name === baseItem.name) return false;
    if (target === "next") return true;
    return (
      item.type === "registry:ui" ||
      item.type === "registry:component" ||
      item.name === "data-table"
    );
  });

  await run(
    shadcnExecutable(),
    [
      "add",
      "--yes",
      "--overwrite",
      "--cwd",
      fixtureDirectory,
      ...installableItems.map((item) => itemUrl(item.name)),
    ],
    root,
  );

  if (target === "vite") createViteBundleEntry(fixtureDirectory);

  console.log(`Building the fresh ${target} consumer...`);
  await run(npmExecutable(), ["run", "build"], fixtureDirectory, {
    NEXT_TELEMETRY_DISABLED: "1",
  });
  console.log(`Fresh ${target} consumer passed.`);
}

function createNextFixture(directory) {
  writeJson(path.join(directory, "package.json"), {
    name: "neobrutal-registry-next-consumer",
    private: true,
    scripts: { build: "next build" },
    dependencies: {
      next: "^16.3.0",
      react: "19.2.7",
      "react-dom": "19.2.7",
    },
    devDependencies: {
      "@tailwindcss/postcss": "^4.3.3",
      "@types/node": "^26.1.1",
      "@types/react": "^19.2.17",
      "@types/react-dom": "^19.2.3",
      tailwindcss: "^4.3.3",
      typescript: "^6.0.3",
    },
  });
  writeJson(path.join(directory, "components.json"), componentsConfig(true));
  writeJson(path.join(directory, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: false,
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
  writeFile(path.join(directory, "src", "index.css"), '@import "tailwindcss";\n');
  writeFile(
    path.join(directory, "src", "app", "layout.tsx"),
    'import "../index.css";\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body>{children}</body></html>;\n}\n',
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
    dependencies: { react: "19.2.7", "react-dom": "19.2.7" },
    devDependencies: {
      "@tailwindcss/vite": "^4.3.3",
      "@types/react": "^19.2.17",
      "@types/react-dom": "^19.2.3",
      "@vitejs/plugin-react": "^6.0.1",
      tailwindcss: "^4.3.3",
      typescript: "^6.0.3",
      vite: "^8.1.4",
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
    '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n',
  );
  writeFile(
    path.join(directory, "vite.config.ts"),
    'import path from "node:path";\nimport tailwindcss from "@tailwindcss/vite";\nimport react from "@vitejs/plugin-react";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({ plugins: [react(), tailwindcss()], resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } } });\n',
  );
  writeFile(path.join(directory, "src", "index.css"), '@import "tailwindcss";\n');
  writeFile(
    path.join(directory, "src", "main.tsx"),
    'import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\n\ncreateRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);\n',
  );
  writeFile(
    path.join(directory, "src", "App.tsx"),
    "export default function App() { return <main>Registry consumer</main>; }\n",
  );
}

function createViteBundleEntry(directory) {
  const componentsDirectory = path.join(directory, "src", "components");
  const componentFiles = collectFiles(componentsDirectory).filter((filePath) =>
    /\.[cm]?[jt]sx?$/.test(filePath),
  );

  if (componentFiles.length === 0) {
    throw new Error("The Vite consumer did not install any component modules");
  }

  const imports = componentFiles
    .sort()
    .map((filePath) => {
      const modulePath = path
        .relative(path.join(directory, "src"), filePath)
        .replaceAll("\\", "/")
        .replace(/\.[cm]?[jt]sx?$/, "");
      return `import "./${modulePath}";`;
    })
    .join("\n");

  writeFile(path.join(directory, "src", "registry-smoke.ts"), `${imports}\n`);
  writeFile(
    path.join(directory, "src", "App.tsx"),
    'import "./registry-smoke";\n\nexport default function App() { return <main>Registry consumer</main>; }\n',
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
  const requestedPath = pathname.replace(/^\/+/, "");
  const filePath = path.resolve(outputDirectory, requestedPath);

  if (
    !filePath.startsWith(`${path.resolve(outputDirectory)}${path.sep}`) ||
    !fs.existsSync(filePath)
  ) {
    response.writeHead(404, { "content-type": "application/json" });
    response.end('{"message":"Registry item not found"}');
    return;
  }

  const content = fs
    .readFileSync(filePath, "utf8")
    .replaceAll("https://neobrutal-ui.andongmin.com/r/", `${registryOrigin}/`);
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(content);
}

function itemUrl(name) {
  return `${registryOrigin}/${name}.json`;
}

function styleUrl(name) {
  return `${registryOrigin}/styling/${name}.json`;
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
    const spawnArguments = process.platform === "win32" ? [] : args;
    const child = spawn(spawnCommand, spawnArguments, {
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
  if (/^[\w./:\\-]+$/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}
