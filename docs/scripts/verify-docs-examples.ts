import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "@typescript/typescript6";
import { COMPONENT_DIRECTORY_LINKS } from "../src/data/component-directory";

type CatalogItem = {
  name: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { path: string; target?: string }[];
};

export type DocsExample = {
  identity: string;
  slug: string;
  document: string;
  sources: Map<string, string>;
};

function packageName(dependency: string) {
  const versionSeparator = dependency.lastIndexOf("@");
  const name = versionSeparator > 0 ? dependency.slice(0, versionSeparator) : dependency;
  return name
    .split("/")
    .slice(0, name.startsWith("@") ? 2 : 1)
    .join("/");
}

function documentedInstallation(slug: string, document: string) {
  const catalog = JSON.parse(fs.readFileSync("../registry/registry.json", "utf8")) as {
    items: CatalogItem[];
  };
  const itemByName = new Map(catalog.items.map((item) => [item.name, item]));
  const installed = new Set<string>();
  const modules = new Map<string, { installedPath: string; source: string }>();
  // The installation guide starts with the shared base and the first Button.
  const packages = new Set(["react", "react-dom"]);
  const pending = [
    "neobrutal-ui",
    "button",
    ...(itemByName.has(slug) ? [slug] : []),
    ...[...document.matchAll(/https:\/\/neobrutal-ui\.andongmin\.com\/r\/([\w-]+)\.json/g)].map(
      (match) => match[1],
    ),
  ];

  // An installation instruction can point to another component's documentation.
  const prose = document.replace(/```[\s\S]*?```/g, "");
  for (const paragraph of prose.split(/\n\s*\n/)) {
    if (!/\binstall\b/i.test(paragraph)) continue;
    for (const match of paragraph.matchAll(/\]\(\/docs\/([\w-]+)\)/g))
      if (itemByName.has(match[1])) pending.push(match[1]);
  }
  for (const match of document.matchAll(/\bnpm install\s+([^\n`]+)/g))
    for (const dependency of match[1].trim().split(/\s+/))
      if (!dependency.startsWith("-")) packages.add(packageName(dependency));

  for (const name of pending) {
    if (installed.has(name)) continue;
    installed.add(name);
    if (name === "utils") {
      assert.ok(itemByName.get("neobrutal-ui")?.registryDependencies?.includes("utils"));
      // shadcn's built-in utility exposes cn, not the docs application's extra helpers.
      modules.set("@/lib/utils", {
        installedPath: "lib/utils.ts",
        source:
          'import type { ClassValue } from "clsx";\nexport declare function cn(...inputs: ClassValue[]): string;\n',
      });
      packages.add("clsx");
      packages.add("tailwind-merge");
      continue;
    }
    const item = itemByName.get(name);
    assert.ok(item, `${slug}: unknown registry item ${name}`);
    for (const file of item.files ?? []) {
      if (!/\.[jt]sx?$/.test(file.path)) continue;
      const installedPath = (file.target ?? file.path.replace(/^src\//, ""))
        .replace(/^~\//, "")
        .replace(/^@(components|ui|lib|hooks)\//, (_, alias: string) =>
          alias === "ui" ? "components/ui/" : `${alias}/`,
        );
      modules.set(`@/${installedPath.replace(/\.[jt]sx?$/, "").replace(/\/index$/, "")}`, {
        installedPath,
        source: fs.readFileSync(path.resolve("../registry", file.path), "utf8"),
      });
    }
    for (const dependency of item.dependencies ?? []) packages.add(packageName(dependency));
    for (const dependency of item.registryDependencies ?? [])
      pending.push(
        dependency === "utils" ? dependency : path.basename(new URL(dependency).pathname, ".json"),
      );
  }
  return { modules, packages };
}

function importedModules(fileName: string, source: string) {
  const dependencies: string[] = [];
  const parsed = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  function visit(node: ts.Node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      dependencies.push(node.moduleSpecifier.text);
    else if (
      (ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require"))) ||
      ts.isImportTypeNode(node)
    ) {
      const argument = ts.isImportTypeNode(node)
        ? ts.isLiteralTypeNode(node.argument)
          ? node.argument.literal
          : undefined
        : node.arguments[0];
      assert.ok(
        argument && ts.isStringLiteralLike(argument),
        `${fileName}: published imports must name their dependency explicitly`,
      );
      dependencies.push(argument.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  return dependencies;
}

export function getDocumentExamples(
  slug: string,
  document: string,
  kind: "preview" | "usage",
): DocsExample[] {
  const examples: DocsExample[] = [];
  if (kind === "usage") {
    const snippets = [...document.matchAll(/(?:^|\n)## Usage\n([\s\S]*?)(?=\n## |$)/g)].flatMap(
      (section) => [...section[1].matchAll(/```tsx\n([\s\S]*?)\n```/g)],
    );
    assert.ok(snippets.length, `${slug}: missing complete TSX Usage example`);
    for (const [index, snippet] of snippets.entries())
      examples.push({
        identity: `${slug}/Usage/${index + 1}`,
        slug,
        document,
        sources: new Map([[path.resolve(`src/__docs_usage__/${slug}-${index}.tsx`), snippet[1]]]),
      });
    return examples;
  }
  for (const preview of document.matchAll(
    /<ComponentPreview\b([^>]*)>([\s\S]*?)<\/ComponentPreview>/g,
  )) {
    const component = preview[1].match(/component="([^"]+)"/)?.[1];
    assert.ok(component, `${slug}: preview has no component name`);
    const example = preview[1].match(/example="([^"]+)"/)?.[1] ?? "primary";
    const identity = `${component}/${example}`;
    const sources = new Map(
      [...preview[2].matchAll(/<include\b[^>]*>\s*([^<]+?)\s*<\/include>/g)].map((match) => {
        const fileName = path.resolve(match[1].trim());
        return [fileName, fs.readFileSync(fileName, "utf8")];
      }),
    );
    assert.ok(sources.size, `${identity}: Code has no included source`);
    examples.push({ identity, slug, document, sources });
  }
  return examples;
}

export function readDocsExamples(kind: "preview" | "usage"): DocsExample[] {
  const slugs =
    kind === "usage"
      ? COMPONENT_DIRECTORY_LINKS.map(({ href }) => href.split("/").pop()!)
      : fs
          .readdirSync("content/docs")
          .filter((name) => name.endsWith(".mdx"))
          .map((name) => name.slice(0, -4));
  return slugs.flatMap((slug) =>
    getDocumentExamples(slug, fs.readFileSync(`content/docs/${slug}.mdx`, "utf8"), kind),
  );
}

// Compile every published source in memory using only its documented consumer installation.
// Real CLI installation and framework integration remain separate registry release gates.
export function verifyDocsExamples(examples: DocsExample[]) {
  const configPath = path.resolve("tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  const options = { ...parsed.options, paths: {}, types: ["react"], noEmit: true };
  const files = new Map<string, string>();
  const aliasesByFile = new Map<string, Map<string, string>>();
  const labels = new Map<string, string>();
  const roots: string[] = [];
  const installations = new Map<string, ReturnType<typeof documentedInstallation>>();

  for (const example of examples) {
    const installationKey = `${example.slug}\0${example.document}`;
    let installation = installations.get(installationKey);
    if (!installation) {
      installation = documentedInstallation(example.slug, example.document);
      installations.set(installationKey, installation);
    }
    for (const [fileName, source] of example.sources)
      for (const dependency of importedModules(fileName, source)) {
        if (dependency.startsWith("@/"))
          assert.ok(
            installation.modules.has(dependency.replace(/\/index$/, "")),
            `${example.identity}: ${dependency} needs a documented install`,
          );
        else if (dependency.startsWith(".")) {
          const target = path.resolve(path.dirname(fileName), dependency);
          assert.ok(
            [
              target,
              `${target}.tsx`,
              `${target}.ts`,
              path.join(target, "index.tsx"),
              path.join(target, "index.ts"),
            ].some((candidate) => example.sources.has(candidate)),
            `${example.identity}: Code omits supporting file ${dependency}`,
          );
        } else
          assert.ok(
            installation.packages.has(packageName(dependency)),
            `${example.identity}: ${dependency} needs a documented npm install`,
          );
      }

    const namespace = path.resolve("src/__docs_examples__", example.identity.replaceAll("/", "-"));
    const aliases = new Map<string, string>();
    for (const [alias, module] of installation.modules) {
      const fileName = path.join(namespace, "installed", module.installedPath);
      files.set(fileName, module.source);
      aliases.set(alias, fileName);
      aliasesByFile.set(fileName, aliases);
      labels.set(fileName, `${example.identity}/installed/${module.installedPath}`);
    }
    for (const [sourcePath, source] of example.sources) {
      const fileName = path.join(
        namespace,
        "published",
        path.relative(path.resolve("src"), sourcePath),
      );
      files.set(fileName, source);
      aliasesByFile.set(fileName, aliases);
      labels.set(fileName, `${example.identity}/${path.relative(path.resolve("src"), sourcePath)}`);
      roots.push(fileName);
    }
  }

  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (name, languageVersion, ...args) => {
    const source = files.get(path.normalize(name));
    return source === undefined
      ? originalGetSourceFile(name, languageVersion, ...args)
      : ts.createSourceFile(name, source, languageVersion, true);
  };
  const originalFileExists = host.fileExists;
  host.fileExists = (name) => files.has(path.normalize(name)) || originalFileExists(name);
  const originalDirectoryExists = host.directoryExists!;
  const directories = new Set<string>();
  for (const fileName of files.keys())
    for (
      let directory = path.dirname(fileName);
      !directories.has(directory);
      directory = path.dirname(directory)
    )
      directories.add(directory);
  host.directoryExists = (name) =>
    directories.has(path.normalize(name)) || originalDirectoryExists(name);
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) => {
      if (name.startsWith("@/")) {
        const resolvedFileName = aliasesByFile
          .get(path.normalize(containingFile))
          ?.get(name.replace(/\/index$/, ""));
        return resolvedFileName ? { resolvedFileName } : undefined;
      }
      return ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
    });
  const program = ts.createProgram(roots, options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (name) => labels.get(path.normalize(name)) ?? name,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => "\n",
      }),
    );
  return examples.length;
}
