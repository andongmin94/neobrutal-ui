import fs from "node:fs";
import path from "node:path";
import ts from "@typescript/typescript6";
import { COMPONENT_DIRECTORY_LINKS } from "../src/data/component-directory";

// Compile in-memory Usage modules against the same component types as the site.
export function verifyDocsUsage() {
  const configPath = path.resolve("tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  const examples = new Map<string, string>();
  for (const link of COMPONENT_DIRECTORY_LINKS) {
    const slug = link.href.split("/").pop()!;
    const source = fs.readFileSync(`content/docs/${slug}.mdx`, "utf8");
    const usage = source.match(/## Usage\s+```tsx\n([\s\S]*?)\n```/);
    if (!usage) throw new Error(`${slug}: missing complete TSX Usage example`);
    examples.set(path.resolve(`src/__docs_usage__/${slug}.tsx`), usage[1]);
  }
  const host = ts.createCompilerHost(parsed.options);
  const original = host.getSourceFile;
  host.getSourceFile = (name, languageVersion, ...args) => {
    const example = examples.get(name);
    return example === undefined
      ? original(name, languageVersion, ...args)
      : ts.createSourceFile(name, example, languageVersion, true, ts.ScriptKind.TSX);
  };
  const program = ts.createProgram([...examples.keys()], { ...parsed.options, noEmit: true }, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (name) => name.replace("src/__docs_usage__/", "content/docs/"),
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => "\n",
      }),
    );
  }
  return examples.size;
}
