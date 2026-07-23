import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve("src/data/stars.ts");
const starsDirectory = path.resolve("src/components/stars");
const exampleKeys = [
  "custom-width-height",
  "dark-mode-stroke",
  "dark-mode",
  "default",
  "with-stroke",
];

function pascalCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

const starFiles = fs
  .readdirSync(starsDirectory)
  .filter((file) => /^s\d+\.tsx$/.test(file))
  .sort((a, b) => {
    const left = Number.parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
    const right = Number.parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
    return left - right;
  });

const imports: string[] = [];
const entries: string[] = [];

for (const file of starFiles) {
  const starNumber = file.match(/^s(\d+)\.tsx$/)?.[1];
  if (!starNumber) continue;

  const name = `Star${starNumber}`;
  const code = fs.readFileSync(path.join(starsDirectory, file), "utf8").replaceAll("\r\n", "\n");

  imports.push(`import ${name} from "@/examples/stars/s${starNumber}";`);
  entries.push(`  { componentExample: ${name}, code: \`${code.replaceAll("`", "\\`")}\` }`);
}

const exampleImports = exampleKeys.map(
  (key) => `import ${pascalCase(key)} from "@/examples/stars/docs/${key}";`,
);
const exampleEntries = exampleKeys.map((key) => `  "${key}": ${pascalCase(key)}`);

const output = `// This file is auto-generated. Do not edit manually.

${imports.join("\n")}
${exampleImports.join("\n")}

type Star = {
  componentExample: React.ComponentType;
  code: string;
};

const STARS: Star[] = [
${entries.join(",\n")}
];

export const STARS_EXAMPLES = {
${exampleEntries.join(",\n")}
};

export default STARS;
`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Generated ${starFiles.length} star examples.`);
