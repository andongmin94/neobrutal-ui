import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "oxfmt";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const chartExamplesDirectory = path.resolve(scriptDirectory, "../examples/ui/chart");
const outputPath = path.resolve(scriptDirectory, "../data/charts.ts");

function componentName(file: string) {
  return path
    .basename(file, ".tsx")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const chartFiles = fs
  .readdirSync(chartExamplesDirectory)
  .filter((file) => file.endsWith(".tsx"))
  .sort();

const imports = chartFiles.map(
  (file) =>
    `import ${componentName(file)} from "@/examples/ui/chart/${file.replace(/\.tsx$/, "")}";`,
);

const entries = chartFiles.map((file) => {
  const name = componentName(file);
  const source = fs
    .readFileSync(path.join(chartExamplesDirectory, file), "utf8")
    .replaceAll("\r\n", "\n")
    .replace(/export default function Component\(\)/, `export function ${name}()`);

  return [
    "  {",
    `    component: ${name},`,
    `    code: ${JSON.stringify(source)},`,
    `    name: "${name}",`,
    "  }",
  ].join("\n");
});

const output = `// This file is auto-generated. Do not edit manually.

${imports.join("\n")}

export interface ChartExample {
  component: React.ComponentType;
  code: string;
  name: string;
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
