import { spawn } from "node:child_process";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";

export function run(command, args, cwd, additionalEnvironment = {}, preserveFile) {
  return new Promise((resolve, reject) => {
    const spawnCommand =
      process.platform === "win32"
        ? [command, ...args].map(quoteCommandArgument).join(" ")
        : command;
    const child = spawn(spawnCommand, process.platform === "win32" ? [] : args, {
      cwd,
      env: { ...process.env, CI: "1", ...additionalEnvironment },
      shell: process.platform === "win32",
      stdio: preserveFile ? ["pipe", "pipe", "pipe"] : "inherit",
      timeout: 300000,
    });
    let declined = false;
    let failure;
    const fail = (error) => {
      failure ??= error;
      child.kill();
    };
    child.once("error", fail);
    if (preserveFile) {
      child.stdin.on("error", fail);
      for (const [input, output] of [
        [child.stdout, process.stdout],
        [child.stderr, process.stderr],
      ]) {
        let pending = "";
        input.setEncoding("utf8");
        input.on("data", (chunk) => {
          output.write(chunk);
          pending = stripVTControlCharacters(pending + chunk);
          const prompt = pending.match(
            /\? The file ([^\r\n]+?) already exists\. Would you like to overwrite\?/,
          );
          if (!prompt) return;
          pending = pending.slice(prompt.index + prompt[0].length);
          if (prompt[1] !== preserveFile || declined) {
            fail(new Error(`Unexpected overwrite prompt: ${prompt[1]}`));
            return;
          }
          declined = true;
          // prompts submits on "n". Do not send Enter into a later question.
          child.stdin.write("n");
        });
      }
    }
    child.once("close", (code, signal) => {
      if (failure) reject(failure);
      else if (code !== 0) {
        reject(new Error(`${path.basename(command)} exited with ${signal ?? code ?? "unknown"}`));
      } else if (preserveFile && !declined) {
        reject(new Error(`The installation never asked to preserve ${preserveFile}`));
      } else resolve();
    });
  });
}

function quoteCommandArgument(value) {
  return /^[\w./:\\-]+$/.test(value) ? value : `"${value.replaceAll('"', '""')}"`;
}
