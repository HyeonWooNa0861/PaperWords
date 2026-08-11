#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

const require = createRequire(import.meta.url);

const allowedHostnames = new Set(["127.0.0.1", "localhost", "::1"]);
const childStopGraceMs = 2_000;
const childKillGraceMs = 1_000;
const parentPollMs = 250;
const signalExitCodes = {
  SIGHUP: 129,
  SIGINT: 130,
  SIGTERM: 143,
  SIGKILL: 137
};

const startedAt = new Date().toISOString();
const originalParentPid = process.ppid;
const cli = parseCliArgs(process.argv.slice(2));
const cwd = validateCwd(cli.cwd ?? process.cwd());
const hostname = validateHostname(cli.hostname);
const port = validatePort(cli.port);
const statePath = validateStatePath(cli.state, cwd, port);
const stateDirectory = dirname(statePath);
const nextBin = require.resolve("next/dist/bin/next");

process.chdir(cwd);
mkdirSync(stateDirectory, { recursive: true });

const baseURL = `http://${hostname}:${port}`;
const state = {
  version: 1,
  state: "starting",
  cwd,
  hostname,
  port,
  statePath,
  launcherPid: process.pid,
  originalParentPid,
  currentParentPid: process.ppid,
  childPid: null,
  childProcessGroupId: null,
  childCommand: process.execPath,
  childArgs: [nextBin, "start", "--hostname", hostname, "--port", String(port)],
  startedAt,
  updatedAt: startedAt
};

writeState({ event: "launcher-starting" });

const child = spawn(process.execPath, state.childArgs, {
  cwd,
  detached: true,
  env: {
    ...process.env,
    PAPERWORDS_SITE_URL: baseURL
  },
  stdio: "inherit"
});

let stopping = false;
let parentMonitor;
let childCloseResult = null;
let childCloseResolve;
const childClosePromise = new Promise((resolveClose) => {
  childCloseResolve = resolveClose;
});

writeState({
  state: "running",
  event: "child-spawned",
  childPid: requireChildPid(child),
  childProcessGroupId: requireChildPid(child)
});

child.once("error", (error) => {
  if (stopping) {
    return;
  }

  writeState({
    state: "failed",
    event: "child-spawn-error",
    error: formatError(error)
  });
  console.error(error);
  process.exit(1);
});

child.once("close", (code, signal) => {
  childCloseResult = { code, signal };
  childCloseResolve(childCloseResult);

  if (stopping) {
    return;
  }

  clearParentMonitor();
  writeState({
    state: "exited",
    event: "child-exited",
    childExitCode: code,
    childExitSignal: signal,
    stoppedAt: new Date().toISOString()
  });
  process.exit(resolveChildExitCode(code, signal));
});

parentMonitor = setInterval(() => {
  if (process.ppid === originalParentPid && process.ppid !== 1) {
    return;
  }

  void stopChildAndExit("parent-lost", signalExitCodes.SIGINT);
}, parentPollMs);
parentMonitor.unref();

for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    void stopChildAndExit(signal, signalExitCodes[signal]);
  });
}

process.on("uncaughtException", (error) => {
  console.error(error);
  void stopChildAndExit("uncaught-exception", 1, formatError(error));
});

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  void stopChildAndExit("unhandled-rejection", 1, formatError(reason));
});

async function stopChildAndExit(reason, exitCode, error) {
  if (stopping) {
    return;
  }

  stopping = true;
  clearParentMonitor();

  writeState({
    state: "stopping",
    event: "stopping-child-process-group",
    stopReason: reason,
    currentParentPid: process.ppid,
    error
  });

  const sentTermSignal = signalChildProcessGroup("SIGTERM");
  let closeResult = await waitForChildClose(childStopGraceMs);

  if (!closeResult && sentTermSignal && isChildAlive()) {
    writeState({
      state: "killing",
      event: "killing-child-process-group",
      stopReason: reason,
      currentParentPid: process.ppid
    });
    signalChildProcessGroup("SIGKILL");
    closeResult = await waitForChildClose(childKillGraceMs);
  }

  writeState({
    state: closeResult ? "exited" : "unknown",
    event: closeResult ? "child-exited-after-stop" : "child-exit-timeout",
    stopReason: reason,
    childExitCode: closeResult?.code ?? null,
    childExitSignal: closeResult?.signal ?? null,
    stoppedAt: new Date().toISOString(),
    currentParentPid: process.ppid
  });

  process.exit(exitCode);
}

function parseCliArgs(argv) {
  const parsed = {};
  const allowed = new Set(["--hostname", "--port", "--cwd", "--state"]);

  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!allowed.has(key)) {
      throw new Error(`Unknown argument: ${key}`);
    }
    if (Object.prototype.hasOwnProperty.call(parsed, key.slice(2))) {
      throw new Error(`Duplicate argument: ${key}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${key}`);
    }
    parsed[key.slice(2)] = value;
    index += 1;
  }

  if (!parsed.hostname) {
    throw new Error("Missing required argument: --hostname");
  }
  if (!parsed.port) {
    throw new Error("Missing required argument: --port");
  }

  return parsed;
}

function validateHostname(value) {
  if (!allowedHostnames.has(value)) {
    throw new Error(`Unsupported hostname: ${value}`);
  }

  return value;
}

function validatePort(value) {
  if (!/^[1-9]\d{0,4}$/.test(value)) {
    throw new Error(`Invalid port: ${value}`);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1_024 || parsed > 65_535) {
    throw new Error(`Port out of allowed range: ${value}`);
  }

  return parsed;
}

function validateCwd(value) {
  const realCwd = realpathSync(resolve(value));
  const packageJsonPath = resolve(realCwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    throw new Error(`Cwd is not a project root: ${realCwd}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  if (packageJson.name !== "paperwords") {
    throw new Error(`Unexpected package name in cwd: ${packageJson.name ?? "missing"}`);
  }

  return realCwd;
}

function validateStatePath(value, root, selectedPort) {
  const outputDirectory = resolve(root, "output", "playwright");
  const defaultStatePath = resolve(outputDirectory, `web-server-${selectedPort}.json`);
  const candidate = value ? resolve(root, value) : defaultStatePath;
  const relativeStatePath = relative(outputDirectory, candidate);

  if (relativeStatePath === "" || relativeStatePath.startsWith("..") || isAbsolute(relativeStatePath)) {
    throw new Error(`State path must stay inside output/playwright: ${candidate}`);
  }

  if (basename(candidate) !== `web-server-${selectedPort}.json`) {
    throw new Error(`State path must be port-specific: ${candidate}`);
  }

  return candidate;
}

function requireChildPid(spawnedChild) {
  if (typeof spawnedChild.pid !== "number") {
    throw new Error("Next child process did not expose a PID");
  }

  return spawnedChild.pid;
}

function clearParentMonitor() {
  if (parentMonitor) {
    clearInterval(parentMonitor);
    parentMonitor = undefined;
  }
}

function signalChildProcessGroup(signal) {
  const childPid = requireChildPid(child);
  try {
    process.kill(-childPid, signal);
    writeState({
      event: "sent-child-process-group-signal",
      lastSignal: signal,
      lastSignalTarget: -childPid
    });
    return true;
  } catch (error) {
    if (isErrnoError(error) && error.code === "ESRCH") {
      writeState({
        event: "child-process-group-already-dead",
        lastSignal: signal,
        lastSignalTarget: -childPid
      });
      return false;
    }

    writeState({
      event: "child-process-group-signal-failed",
      lastSignal: signal,
      lastSignalTarget: -childPid,
      error: formatError(error)
    });
    return false;
  }
}

function waitForChildClose(timeoutMs) {
  if (childCloseResult) {
    return Promise.resolve(childCloseResult);
  }

  return new Promise((resolveClose) => {
    const timeout = setTimeout(() => {
      resolveClose(null);
    }, timeoutMs);
    timeout.unref();

    childClosePromise.then((result) => {
      clearTimeout(timeout);
      resolveClose(result);
    });
  });
}

function isChildAlive() {
  const childPid = requireChildPid(child);
  try {
    process.kill(childPid, 0);
    return true;
  } catch (error) {
    if (isErrnoError(error) && error.code === "ESRCH") {
      return false;
    }

    throw error;
  }
}

function resolveChildExitCode(code, signal) {
  if (typeof code === "number") {
    return code;
  }

  if (signal && signal in signalExitCodes) {
    return signalExitCodes[signal];
  }

  return 1;
}

function writeState(updates) {
  Object.assign(state, updates, {
    updatedAt: new Date().toISOString()
  });
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function isErrnoError(error) {
  return error instanceof Error && "code" in error;
}

function formatError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    name: typeof error,
    message: String(error)
  };
}
