import { createConnection, createServer } from "node:net";
import { spawn } from "node:child_process";

const DEFAULT_START_PORT = 3000;
const MAX_SCAN_STEPS = 100;

function parsePort(rawValue, fallback) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    return fallback;
  }
  return value;
}

function canBindPort(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

function canConnect(port, host) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    let settled = false;

    const done = (value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(180);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function isPortFree(port) {
  const [v4InUse, v6InUse] = await Promise.all([
    canConnect(port, "127.0.0.1"),
    canConnect(port, "::1"),
  ]);
  if (v4InUse || v6InUse) {
    return false;
  }

  return canBindPort(port);
}

async function pickPort(startPort) {
  for (let i = 0; i <= MAX_SCAN_STEPS; i += 1) {
    const current = startPort + i;
    if (current > 65535) break;
    const free = await isPortFree(current);
    if (free) return current;
  }
  return 0;
}

async function main() {
  const startPort = parsePort(process.env.PORT, DEFAULT_START_PORT);
  const selectedPort = await pickPort(startPort);

  if (selectedPort === 0) {
    console.warn(
      `[dev-port] Could not find free port from ${startPort}..${
        startPort + MAX_SCAN_STEPS
      }. Falling back to random free port.`,
    );
  }

  const resolvedPort = selectedPort || 0;
  if (process.env.PORT_SCAN_ONLY === "1") {
    process.stdout.write(`${resolvedPort}\n`);
    return;
  }

  if (resolvedPort !== startPort) {
    console.log(
      `[dev-port] Port ${startPort} is occupied. Using ${
        resolvedPort === 0 ? "a random free port" : resolvedPort
      }.`,
    );
  }

  const vinextBin = process.platform === "win32" ? "vinext.cmd" : "vinext";
  const args = ["dev", "--port", String(resolvedPort)];
  const child = spawn(vinextBin, args, {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("[dev-port] Failed to start dev server:", error);
  process.exit(1);
});
