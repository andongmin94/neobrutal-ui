import fs from "node:fs";
import path from "node:path";

fs.rmSync(path.resolve("public", "r"), { force: true, recursive: true });
