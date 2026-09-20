import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "oxfmt";
import { highlight } from "fumadocs-core/highlight";
import { renderToStaticMarkup } from "react-dom/server";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(scriptDirectory, "../components/ui");
const outputPath = path.resolve(scriptDirectory, "../data/charts.ts");
const sourceOutputDirectory = path.resolve(scriptDirectory, "../../public/chart-source");
const chartFiles = fs
  .readdirSync(sourceDirectory)
  .filter((file) => file.startsWith("chart-") && file.endsWith(".tsx"))
  .sort();

function componentName(file: string) {
  return path
    .basename(file, ".tsx")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const names = chartFiles.map(componentName);
if (!chartFiles.length || new Set(names).size !== names.length) {
  throw new Error("Expected unique installable chart recipes. Build the registry first.");
}

fs.rmSync(sourceOutputDirectory, { recursive: true, force: true });
fs.mkdirSync(sourceOutputDirectory, { recursive: true });

const imports = chartFiles.map(
  (file) => `import ${componentName(file)} from "@/components/ui/${path.basename(file, ".tsx")}";`,
);
const entries = await Promise.all(
  chartFiles.map(async (file) => {
    const source = fs
      .readFileSync(path.join(sourceDirectory, file), "utf8")
      .replaceAll("\r\n", "\n");
    const highlighted = await highlight(source, {
      lang: "tsx",
      themes: { light: "dark-plus", dark: "dark-plus" },
      defaultColor: false,
      components: { pre: ({ children }) => children },
    });
    fs.writeFileSync(
      path.join(sourceOutputDirectory, `${path.basename(file, ".tsx")}.json`),
      `${JSON.stringify({ code: source, highlightedCode: renderToStaticMarkup(highlighted) })}\n`,
      "utf8",
    );
    return [
      "  {",
      `    component: ${componentName(file)},`,
      `    name: "${componentName(file)}",`,
      `    registryName: "${path.basename(file, ".tsx")}",`,
      "  }",
    ].join("\n");
  }),
);

const output = `// This file is auto-generated. Do not edit manually.

${imports.join("\n")}

export interface ChartExample {
  component: React.ComponentType;
  name: string;
  registryName: string;
}

export const charts: ChartExample[] = [
${entries.join(",\n")}
];
`;
const { code } = await format(outputPath, output);
const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : undefined;
if (current !== code) fs.writeFileSync(outputPath, code, "utf8");
console.log(`${chartFiles.length} installable chart recipes synchronized.`);
