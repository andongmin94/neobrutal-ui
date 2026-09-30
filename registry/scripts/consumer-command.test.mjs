import assert from "node:assert/strict";
import { once } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { run, spawnConsumerProcess, terminateConsumerProcess } from "./consumer-command.mjs";

function fixture(source, preserveFile = "button.tsx") {
  return run(
    process.execPath,
    ["--input-type=module", "-e", source],
    process.cwd(),
    {},
    preserveFile,
  );
}

for (const stream of ["stdout", "stderr"]) {
  test(`declines the expected overwrite on ${stream}, including split colored output`, async () => {
    await fixture(`
      const output = process.${stream};
      process.stdin.once("data", (answer) => {
        if (answer.toString() !== "n") process.exit(2);
        output.write("\\nPreserved button; installed remaining files.\\n");
        process.stdin.destroy();
      });
      output.write("? The file \\x1b[36mbutton.tsx\\x1b[0m already exists. ");
      setTimeout(() => output.write("Would you like to overwrite? › (y/N)"), 20);
    `);
  });
}

test("successful exit without a preservation prompt fails", async () => {
  await assert.rejects(fixture("process.exit(0)"), /never asked to preserve button.tsx/);
});

test("an unexpected file prompt fails instead of granting overwrite permission", async () => {
  await assert.rejects(
    fixture(`
      process.stdin.resume();
      process.stdout.write("? The file secrets.ts already exists. Would you like to overwrite?");
    `),
    /Unexpected overwrite prompt: secrets.ts/,
  );
});

test("a failed command stops its actual descendants on every platform", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-command-tree-"));
  const pidPath = path.join(directory, "child.pid");
  t.after(async () => {
    if (fs.existsSync(pidPath)) {
      try {
        process.kill(Number(fs.readFileSync(pidPath, "utf8")));
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    }
    await fs.promises.rm(directory, { force: true, recursive: true });
  });
  await assert.rejects(
    fixture(`
      import { spawn } from "node:child_process";
      import fs from "node:fs";
      const descendant = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
        stdio: "ignore",
      });
      fs.writeFileSync(${JSON.stringify(pidPath)}, String(descendant.pid));
      process.stdin.resume();
      process.stdout.write("? The file secrets.ts already exists. Would you like to overwrite?");
    `),
    /Unexpected overwrite prompt: secrets.ts/,
  );
  const descendantPid = Number(fs.readFileSync(pidPath, "utf8"));
  await assertProcessExited(descendantPid);
});

test(
  "POSIX nonzero exits stop the exited leader's remaining command group",
  { skip: process.platform === "win32", timeout: 10000 },
  async (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-failed-command-"));
    const pidPath = path.join(directory, "processes.json");
    let exited = false;
    t.after(async () => {
      if (!exited && fs.existsSync(pidPath)) {
        const { command } = JSON.parse(fs.readFileSync(pidPath, "utf8"));
        try {
          process.kill(-command, "SIGKILL");
        } catch (error) {
          if (error.code !== "ESRCH") throw error;
        }
      }
      await fs.promises.rm(directory, { force: true, recursive: true });
    });
    await assert.rejects(
      fixture(`
        import { spawn } from "node:child_process";
        import fs from "node:fs";
        const descendant = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
          stdio: "ignore",
        });
        fs.writeFileSync(${JSON.stringify(pidPath)}, JSON.stringify({
          command: process.pid,
          descendant: descendant.pid,
        }));
        process.exit(3);
      `),
      /exited with 3/,
    );
    await assertProcessExited(JSON.parse(fs.readFileSync(pidPath, "utf8")).descendant);
    exited = true;
  },
);

test(
  "POSIX successful exits stop descendants without inherited pipes and remain successful",
  { skip: process.platform === "win32", timeout: 10000 },
  async (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-successful-command-"));
    const pidPath = path.join(directory, "processes.json");
    let exited = false;
    t.after(async () => {
      if (!exited && fs.existsSync(pidPath)) {
        const { command } = JSON.parse(fs.readFileSync(pidPath, "utf8"));
        try {
          process.kill(-command, "SIGKILL");
        } catch (error) {
          if (error.code !== "ESRCH") throw error;
        }
      }
      await fs.promises.rm(directory, { force: true, recursive: true });
    });
    await run(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
          import { spawn } from "node:child_process";
          import fs from "node:fs";
          const descendant = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
            stdio: "ignore",
          });
          fs.writeFileSync(${JSON.stringify(pidPath)}, JSON.stringify({
            command: process.pid,
            descendant: descendant.pid,
          }));
          process.exit(0);
        `,
      ],
      process.cwd(),
    );
    await assertProcessExited(JSON.parse(fs.readFileSync(pidPath, "utf8")).descendant);
    exited = true;
  },
);

test(
  "POSIX termination closes descendant-held pipes after the group leader exits",
  { skip: process.platform === "win32", timeout: 10000 },
  async (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-exited-command-"));
    const pidPath = path.join(directory, "child.pid");
    const consumer = spawnConsumerProcess(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
          import { spawn } from "node:child_process";
          import fs from "node:fs";
          const descendant = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
            stdio: "inherit",
          });
          fs.writeFileSync(${JSON.stringify(pidPath)}, String(descendant.pid));
          process.exit(0);
        `,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let closed = false;
    consumer.once("close", () => {
      closed = true;
    });
    t.after(async () => {
      if (!closed) {
        try {
          process.kill(-consumer.pid, "SIGKILL");
        } catch (error) {
          if (error.code !== "ESRCH") throw error;
        }
      }
      await terminateConsumerProcess(consumer);
      await fs.promises.rm(directory, { force: true, recursive: true });
    });
    const [code] = await once(consumer, "exit");
    assert.equal(code, 0);
    assert.equal(closed, false);
    await terminateConsumerProcess(consumer);
    assert.equal(closed, true);
    await assertProcessExited(Number(fs.readFileSync(pidPath, "utf8")));
  },
);

test(
  "POSIX consumer termination closes its nested command group before cleanup",
  { skip: process.platform === "win32", timeout: 10000 },
  async (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-nested-command-"));
    const pidPath = path.join(directory, "processes.json");
    const cleanupPath = path.join(directory, "cleanup.txt");
    const commandModule = new URL("./consumer-command.mjs", import.meta.url).href;
    const commandSource = `
      import { spawn } from "node:child_process";
      import fs from "node:fs";
      const descendant = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
        stdio: "ignore",
      });
      fs.writeFileSync(${JSON.stringify(pidPath)}, JSON.stringify({
        command: process.pid,
        descendant: descendant.pid,
      }));
      process.stdout.write("ready\\n");
      setInterval(() => {}, 1000);
    `;
    const consumer = spawnConsumerProcess(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
          import fs from "node:fs";
          import { run } from ${JSON.stringify(commandModule)};
          let failure;
          try {
            await run(process.execPath, ["--input-type=module", "-e", ${JSON.stringify(commandSource)}], process.cwd());
          } catch (error) {
            process.exitCode = 1;
            failure = error;
          } finally {
            fs.writeFileSync(${JSON.stringify(cleanupPath)}, failure?.message ?? "unexpected success");
          }
        `,
      ],
      { stdio: ["ignore", "pipe", "ignore"] },
    );
    t.after(async () => {
      if (fs.existsSync(pidPath)) {
        const tree = JSON.parse(fs.readFileSync(pidPath, "utf8"));
        for (const pid of [-tree.command, tree.descendant]) {
          try {
            process.kill(pid, "SIGKILL");
          } catch (error) {
            if (error.code !== "ESRCH") throw error;
          }
        }
      }
      await terminateConsumerProcess(consumer);
      await fs.promises.rm(directory, { force: true, recursive: true });
    });
    await new Promise((resolve, reject) => {
      consumer.once("error", reject);
      consumer.once("exit", () => reject(new Error("Consumer exited before its command started")));
      consumer.stdout.once("data", resolve);
    });
    await terminateConsumerProcess(consumer);
    assert.equal(consumer.exitCode, 1);
    assert.match(fs.readFileSync(cleanupPath, "utf8"), /interrupted by SIGTERM/);
    await assertProcessExited(JSON.parse(fs.readFileSync(pidPath, "utf8")).descendant);
  },
);

for (const signal of ["SIGTERM", "SIGINT"]) {
  test(
    `POSIX independent runner forwards ${signal}, drains workers and leaves queued items stopped`,
    { skip: process.platform === "win32", timeout: 10000 },
    async (t) => {
      const directory = fs.mkdtempSync(path.join(os.tmpdir(), "neobrutal-runner-cancel-"));
      const registryRoot = path.join(directory, "registry");
      const scripts = path.join(registryRoot, "scripts");
      fs.mkdirSync(scripts, { recursive: true });
      fs.mkdirSync(path.join(registryRoot, "public/r"), { recursive: true });
      for (const name of ["consumer-command.mjs", "verify-independent-items.mjs"]) {
        fs.copyFileSync(new URL(`./${name}`, import.meta.url), path.join(scripts, name));
      }
      const names = ["first", "second", "third", "queued"];
      fs.writeFileSync(
        path.join(registryRoot, "public/r/registry.json"),
        JSON.stringify({
          items: names.map((name) => ({
            name,
            type: "registry:ui",
            files: [{ path: "fixture.tsx" }],
          })),
        }),
      );
      const commandSource = `
        const { spawn } = require("node:child_process");
        const fs = require("node:fs");
        const descendant = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
          stdio: "ignore",
        });
        fs.writeFileSync(process.argv[1], JSON.stringify({
          verifier: process.ppid,
          command: process.pid,
          descendant: descendant.pid,
        }));
        setInterval(() => {}, 1000);
      `;
      fs.writeFileSync(
        path.join(scripts, "verify-consumer.mjs"),
        `
          import fs from "node:fs";
          import path from "node:path";
          import { run } from "./consumer-command.mjs";
          const name = process.argv.find((argument) => argument.startsWith("--item=")).slice(7);
          const pidPath = path.join(process.cwd(), name + ".json");
          try {
            await run(process.execPath, ["-e", ${JSON.stringify(commandSource)}, pidPath], process.cwd());
          } catch (error) {
            fs.writeFileSync(path.join(process.cwd(), name + ".cleanup"), error.message);
            process.exitCode = 1;
          }
        `,
      );
      const runner = spawnConsumerProcess(
        process.execPath,
        [path.join(scripts, "verify-independent-items.mjs")],
        { cwd: registryRoot, stdio: ["ignore", "pipe", "pipe"] },
      );
      let closed = false;
      let exited = false;
      runner.once("close", () => {
        closed = true;
      });
      t.after(async () => {
        if (!closed) await terminateConsumerProcess(runner);
        for (const name of exited ? [] : names) {
          const pidPath = path.join(registryRoot, `${name}.json`);
          if (!fs.existsSync(pidPath)) continue;
          const tree = JSON.parse(fs.readFileSync(pidPath, "utf8"));
          for (const pid of [-tree.verifier, -tree.command]) {
            try {
              process.kill(pid, "SIGKILL");
            } catch (error) {
              if (error.code !== "ESRCH") throw error;
            }
          }
        }
        await fs.promises.rm(directory, { force: true, recursive: true });
      });
      for (const name of names.slice(0, 3)) {
        const pidPath = path.join(registryRoot, `${name}.json`);
        for (let attempt = 0; !fs.existsSync(pidPath) && attempt < 200; attempt++) await delay(20);
        assert.ok(fs.existsSync(pidPath), `${name} verifier did not start`);
      }
      const closing = once(runner, "close");
      runner.kill(signal);
      const [code] = await closing;
      assert.equal(code, 1);
      assert.equal(fs.existsSync(path.join(registryRoot, "queued.json")), false);
      for (const name of names.slice(0, 3)) {
        assert.match(
          fs.readFileSync(path.join(registryRoot, `${name}.cleanup`), "utf8"),
          new RegExp(`interrupted by ${signal}`),
        );
        const tree = JSON.parse(fs.readFileSync(path.join(registryRoot, `${name}.json`), "utf8"));
        for (const pid of Object.values(tree)) await assertProcessExited(pid);
      }
      exited = true;
    },
  );
}

test("a nonzero exit after declining still fails the command", async () => {
  await assert.rejects(
    fixture(`
      process.stdin.once("data", () => process.exit(3));
      process.stdout.write("? The file button.tsx already exists. Would you like to overwrite?");
    `),
    /exited with 3/,
  );
});

test("ordinary commands do not need an interactive answer", async () => {
  await run(process.execPath, ["-e", "process.exit(0)"], process.cwd());
});

test("closes input after declining so the installer can exit normally", async () => {
  await fixture(`
    let answered = false;
    process.stdin.on("data", (answer) => {
      answered = answer.toString() === "n";
    });
    process.stdin.once("end", () => {
      if (!answered) process.exit(2);
    });
    setTimeout(() => process.exit(9), 750).unref();
    process.stdout.write("? The file button.tsx already exists. Would you like to overwrite?");
  `);
});

async function assertProcessExited(pid) {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      process.kill(pid, 0);
    } catch (error) {
      assert.equal(error.code, "ESRCH");
      return;
    }
    await delay(20);
  }
  assert.fail(`Command descendant ${pid} is still running after termination`);
}
