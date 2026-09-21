import fs from "node:fs";
import path from "node:path";

const assetsDirectory = path.resolve("dist", "public", "assets");
const kibibyte = 1024;
const limits = {
  largestJavaScript: 700 * kibibyte,
  largestStylesheet: 384 * kibibyte,
  totalStylesheets: 448 * kibibyte,
  largestFont: 512 * kibibyte,
};

if (!fs.existsSync(assetsDirectory)) {
  throw new Error(`Build assets do not exist: ${assetsDirectory}`);
}

const files = fs
  .readdirSync(assetsDirectory, { recursive: true })
  .filter((entry) => typeof entry === "string")
  .map((entry) => path.join(assetsDirectory, entry))
  .filter((entry) => fs.statSync(entry).isFile())
  .map((entry) => ({
    path: path.relative(assetsDirectory, entry).replaceAll("\\", "/"),
    bytes: fs.statSync(entry).size,
    extension: path.extname(entry).toLowerCase(),
  }));

function assetsWithExtensions(extensions) {
  return files.filter((file) => extensions.has(file.extension));
}

function largest(filesInGroup) {
  return filesInGroup.reduce((current, file) => (file.bytes > current.bytes ? file : current), {
    path: "(none)",
    bytes: 0,
  });
}

function formatBytes(bytes) {
  return `${(bytes / kibibyte).toFixed(1)} KiB`;
}

const scripts = assetsWithExtensions(new Set([".js", ".mjs"]));
const stylesheets = assetsWithExtensions(new Set([".css"]));
const fonts = assetsWithExtensions(new Set([".woff", ".woff2", ".ttf", ".otf"]));
const largestScript = largest(scripts);
const largestStylesheet = largest(stylesheets);
const largestFont = largest(fonts);
const totalStylesheets = stylesheets.reduce((total, file) => total + file.bytes, 0);
const failures = [];

for (const [label, actual, limit] of [
  ["largest JavaScript asset", largestScript.bytes, limits.largestJavaScript],
  ["largest stylesheet", largestStylesheet.bytes, limits.largestStylesheet],
  ["total stylesheets", totalStylesheets, limits.totalStylesheets],
  ["largest font asset", largestFont.bytes, limits.largestFont],
]) {
  if (actual > limit) failures.push(`${label}: ${formatBytes(actual)} > ${formatBytes(limit)}`);
}

const nonWoff2Fonts = fonts.filter((file) => file.extension !== ".woff2");
if (nonWoff2Fonts.length) {
  failures.push(`non-WOFF2 font assets: ${nonWoff2Fonts.map((file) => file.path).join(", ")}`);
}

console.log(
  JSON.stringify(
    {
      largestJavaScript: { ...largestScript, size: formatBytes(largestScript.bytes) },
      largestStylesheet: { ...largestStylesheet, size: formatBytes(largestStylesheet.bytes) },
      totalStylesheets: formatBytes(totalStylesheets),
      largestFont: { ...largestFont, size: formatBytes(largestFont.bytes) },
      fontAssetCount: fonts.length,
    },
    null,
    2,
  ),
);

if (failures.length) {
  throw new Error(`Build budget exceeded:\n- ${failures.join("\n- ")}`);
}
