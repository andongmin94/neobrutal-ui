import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const docsRoot = process.cwd();
const commitCandidates = [process.env.VERCEL_GIT_COMMIT_SHA, process.env.GITHUB_SHA];

try {
  commitCandidates.push(
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: path.resolve(docsRoot, ".."),
      encoding: "utf8",
    }).trim(),
  );
} catch {
  // A source archive may not contain Git metadata.
}

const sourceCommit = commitCandidates.find((candidate) => /^[\da-f]{40}$/i.test(candidate ?? ""));
const payload = `${JSON.stringify({ commit: sourceCommit?.toLowerCase() ?? "local" }, null, 2)}\n`;
const outputPaths = [path.join(docsRoot, "dist", "public", "build-info.json")];

if (process.env.VERCEL) {
  outputPaths.push(path.join(docsRoot, ".vercel", "output", "static", "build-info.json"));
}

for (const outputPath of outputPaths) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, payload, "utf8");
}
