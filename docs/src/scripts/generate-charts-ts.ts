import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "oxfmt";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const chartExamplesDirectory = path.resolve(scriptDirectory, "../examples/ui/chart");
const registryChartsDirectory = path.resolve(scriptDirectory, "../components/ui");
const outputPath = path.resolve(scriptDirectory, "../data/charts.ts");

function componentName(file: string) {
  return path
    .basename(file, ".tsx")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const chartFiles = [
  ...fs
    .readdirSync(chartExamplesDirectory)
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => ({
      file,
      directory: chartExamplesDirectory,
      importPath: `@/examples/ui/chart/${file.replace(/\.tsx$/, "")}`,
      registryName: undefined,
    })),
  ...fs
    .readdirSync(registryChartsDirectory)
    .filter((file) => file.startsWith("chart-") && file.endsWith(".tsx"))
    .map((file) => ({
      file,
      directory: registryChartsDirectory,
      importPath: `@/components/ui/${file.replace(/\.tsx$/, "")}`,
      registryName: file.replace(/\.tsx$/, ""),
    })),
].sort((a, b) => a.file.localeCompare(b.file));

const names = chartFiles.map(({ file }) => componentName(file));
if (new Set(names).size !== names.length) {
  throw new Error("Duplicate chart source. Keep installable recipes in registry/src only.");
}

const imports = chartFiles.map(
  ({ file, importPath }) => `import ${componentName(file)} from "${importPath}";`,
);

const entries = chartFiles.map(({ file, directory, registryName }) => {
  const name = componentName(file);
  const source = fs.readFileSync(path.join(directory, file), "utf8").replaceAll("\r\n", "\n");

  return [
    "  {",
    `    component: ${name},`,
    `    code: ${JSON.stringify(source)},`,
    `    name: "${name}",`,
    ...(registryName ? [`    registryName: "${registryName}",`] : []),
    "  }",
  ].join("\n");
});

const output = `// This file is auto-generated. Do not edit manually.

${imports.join("\n")}

export interface ChartExample {
  component: React.ComponentType;
  code: string;
  name: string;
  registryName?: string;
}

export const charts: ChartExample[] = [
${entries.join(",\n")}
];
`;

const { code } = await format(outputPath, output);
const current = fs.existsSync(outputPath)
  ? fs.readFileSync(outputPath, "utf8").replaceAll("\r\n", "\n")
  : undefined;

if (current !== code) {
  fs.writeFileSync(outputPath, code, "utf8");
  console.log(`Updated ${chartFiles.length} chart examples.`);
} else {
  console.log(`${chartFiles.length} chart examples are up to date.`);
}
