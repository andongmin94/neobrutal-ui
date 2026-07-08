import fs from "fs";
import path from "path";

const sourceDir = path.resolve(process.cwd(), "public", "r");
const docsPublicDir = path.resolve(process.cwd(), "..", "docs", "public");
const targetDir = path.join(docsPublicDir, "r");

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
