import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type MarkdownIt from "markdown-it";

export type CodeImportOptions = {
  rootDir?: string;
};

const fileMetaPattern = /(?:^|\s)file=(?:"([^"]+)"|'([^']+)'|([^\s]+))/;
const rootMarker = "<rootDir>/";
const defaultRoot = fileURLToPath(new URL("../..", import.meta.url));

function isInsideRoot(root: string, target: string) {
  const relative = path.relative(root, target);

  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

function resolveImport(root: string, source: string) {
  if (!source.startsWith(rootMarker)) {
    throw new Error(`Code import paths must start with ${rootMarker}: ${source}`);
  }

  const relativeSource = source.slice(rootMarker.length);

  if (!relativeSource || relativeSource.includes("\0") || path.isAbsolute(relativeSource)) {
    throw new Error(`Invalid code import path: ${source}`);
  }

  const candidate = path.resolve(root, relativeSource);

  if (!isInsideRoot(root, candidate)) {
    throw new Error(`Code import escapes the docs root: ${source}`);
  }

  let resolved: string;

  try {
    resolved = fs.realpathSync(candidate);
  } catch {
    throw new Error(`Code import does not exist: ${source}`);
  }

  if (!isInsideRoot(root, resolved)) {
    throw new Error(`Code import resolves outside the docs root: ${source}`);
  }

  if (!fs.statSync(resolved).isFile()) {
    throw new Error(`Code import is not a file: ${source}`);
  }

  return {
    relative: path.relative(root, resolved).split(path.sep).join("/"),
    resolved,
  };
}

export default function codeImport(md: MarkdownIt, options: CodeImportOptions = {}) {
  const configuredRoot = path.resolve(options.rootDir ?? defaultRoot);
  const root = fs.realpathSync(configuredRoot);

  md.core.ruler.after("block", "neobrutal-code-import", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "fence" || token.content.trim() !== "") continue;

      const match = token.info.match(fileMetaPattern);
      const source = match?.[1] ?? match?.[2] ?? match?.[3];

      if (!source) continue;

      const imported = resolveImport(root, source);
      const content = fs.readFileSync(imported.resolved, "utf8").replace(/\r\n?/g, "\n");

      token.content = content.endsWith("\n") ? content : `${content}\n`;
      token.meta = {
        ...token.meta,
        codeImport: {
          source: imported.relative,
        },
      };
    }
  });
}
