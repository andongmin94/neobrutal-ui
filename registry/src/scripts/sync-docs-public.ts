import fs from "fs";
import path from "path";

const sourceDir = path.resolve(process.cwd(), "public", "r");
const sourceTemplatesDir = path.resolve(process.cwd(), "src", "blocks", "templates");
const docsPublicDir = path.resolve(process.cwd(), "..", "docs", "public");
const docsTemplatesDir = path.resolve(
  process.cwd(),
  "..",
  "docs",
  "src",
  "components",
  "templates",
);
const docsLibDir = path.resolve(process.cwd(), "..", "docs", "src", "lib");
const targetDir = path.join(docsPublicDir, "r");
const templateFiles = [
  "blog-post-template.tsx",
  "blog-template.tsx",
  "cms-template.tsx",
  "link-hub-template.tsx",
  "portfolio-template.tsx",
];

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Registry output does not exist: ${sourceDir}`);
}

if (!fs.existsSync(docsPublicDir)) {
  throw new Error(`Docs public directory does not exist: ${docsPublicDir}`);
}

fs.rmSync(targetDir, { force: true, recursive: true });
fs.mkdirSync(docsPublicDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Synced registry output to: ${targetDir}`);

fs.mkdirSync(docsTemplatesDir, { recursive: true });

const expectedTemplateFiles = new Set(templateFiles);

for (const entry of fs.readdirSync(docsTemplatesDir, { withFileTypes: true })) {
  if (
    entry.isFile() &&
    entry.name.endsWith("-template.tsx") &&
    !expectedTemplateFiles.has(entry.name)
  ) {
    fs.rmSync(path.join(docsTemplatesDir, entry.name));
  }
}

for (const fileName of templateFiles) {
  const sourceFile = path.join(sourceTemplatesDir, fileName);

  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Template source does not exist: ${sourceFile}`);
  }

  fs.copyFileSync(sourceFile, path.join(docsTemplatesDir, fileName));
}

console.log(`Synced template components to: ${docsTemplatesDir}`);

fs.mkdirSync(docsLibDir, { recursive: true });
fs.copyFileSync(
  path.resolve(process.cwd(), "src", "lib", "blog-posts.ts"),
  path.join(docsLibDir, "blog-posts.ts"),
);

console.log(`Synced blog post data to: ${docsLibDir}`);
