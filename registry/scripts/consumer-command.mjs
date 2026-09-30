import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { promisify, stripVTControlCharacters } from "node:util";

const activeConsumerProcesses = new WeakSet();

export function spawnConsumerProcess(command, args, options) {
  const child = spawn(command, args, {
    ...options,
    detached: process.platform !== "win32",
    windowsHide: true,
  });
  activeConsumerProcesses.add(child);
  child.once("close", () => activeConsumerProcesses.delete(child));
  return child;
}

export async function terminateConsumerProcess(child, signal = "SIGTERM") {
  if (!child.pid || !activeConsumerProcesses.has(child)) return;
  if (process.platform === "win32" && (child.exitCode !== null || child.signalCode !== null)) {
    return;
  }
  const closed = new Promise((resolve) => child.once("close", resolve));
  try {
    if (process.platform === "win32") {
      await promisify(execFile)("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
      });
    } else {
      process.kill(-child.pid, signal);
    }
  } catch (error) {
    if (error.code !== "ESRCH" && activeConsumerProcesses.has(child)) {
      throw error;
    }
  }
  await closed;
}

export function run(command, args, cwd, additionalEnvironment = {}, preserveFile) {
  return new Promise((resolve, reject) => {
    const useShell = process.platform === "win32" && /\.(cmd|bat)$/i.test(command);
    const spawnCommand = useShell
      ? [command, ...args].map(quoteCommandArgument).join(" ")
      : command;
    const child = spawnConsumerProcess(spawnCommand, useShell ? [] : args, {
      cwd,
      env: { ...process.env, CI: "1", ...additionalEnvironment },
      shell: useShell,
      stdio: preserveFile ? ["pipe", "pipe", "pipe"] : "inherit",
    });
    let declined = false;
    let failure;
    let termination;
    const terminate = () => {
      termination ??= terminateConsumerProcess(child, "SIGKILL").catch((terminationError) => {
        failure = failure
          ? new AggregateError([failure, terminationError], "Could not stop consumer command")
          : terminationError;
        child.kill();
      });
    };
    const fail = (error) => {
      failure ??= error;
      terminate();
    };
    const timeout = setTimeout(
      () => fail(new Error(`${path.basename(command)} was terminated after 300000ms`)),
      300000,
    );
    // An outer consumer timeout signals this process, whose command has a
    // separate group. Reject after that group closes so the caller can clean up.
    const onSigterm = () => fail(new Error(`${path.basename(command)} interrupted by SIGTERM`));
    const onSigint = () => fail(new Error(`${path.basename(command)} interrupted by SIGINT`));
    process.once("SIGTERM", onSigterm);
    process.once("SIGINT", onSigint);
    child.once("error", fail);
    child.once("exit", (code, signal) => {
      // An exited POSIX leader can leave its own group alive. Stop that group
      // while it is still registered, before close releases the command.
      if (process.platform !== "win32") {
        if (code !== 0) {
          fail(new Error(`${path.basename(command)} exited with ${signal ?? code ?? "unknown"}`));
        } else {
          terminate();
        }
      }
    });
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
          child.stdin.end("n");
        });
      }
    }
    child.once("close", async (code, signal) => {
      clearTimeout(timeout);
      process.removeListener("SIGTERM", onSigterm);
      process.removeListener("SIGINT", onSigint);
      await termination;
      if (failure) reject(failure);
      else if (child.killed) reject(new Error(`${path.basename(command)} was terminated`));
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
