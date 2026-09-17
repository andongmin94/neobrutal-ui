import fs from "node:fs";
import path from "node:path";

const outputDirectory = path.resolve("public", "r");

if (!fs.existsSync(outputDirectory)) {
  throw new Error(`Registry output does not exist: ${outputDirectory}`);
}

for (const relativePath of fs.readdirSync(outputDirectory, { recursive: true })) {
  const filePath = path.join(outputDirectory, relativePath);

  if (!fs.statSync(filePath).isFile() || path.extname(filePath) !== ".json") continue;

  const normalized = fs
    .readFileSync(filePath, "utf8")
    .replaceAll("\\r\\n", "\\n")
    .replaceAll("\r\n", "\n")
    .trimEnd();

  fs.writeFileSync(filePath, normalized, "utf8");
}

fs.mkdirSync(path.resolve("public"), { recursive: true });
fs.copyFileSync(path.resolve("index.html"), path.resolve("public", "index.html"));
