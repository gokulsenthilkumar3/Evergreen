"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID, randomBytes } = require("node:crypto");
const { execFileSync, spawn } = require("node:child_process");
const { homedir } = require("node:os");
const {
  requireInstallationLicence,
  unprotectOwnerData,
} = require("../../packages/types/dist/licensing.js");
const { snapshot } = require("../release/database.cjs");
const root = path.resolve(__dirname, "../..");
const powershell = path.join(
  process.env.SystemRoot || "C:\\Windows",
  "System32/WindowsPowerShell/v1.0/powershell.exe",
);
const local = process.env.LOCALAPPDATA || path.join(homedir(), "AppData/Local");
const directory = path.join(local, "EverGreen/owner-host");
const configFile = path.join(directory, "runtime.dpapi");
const keyDirectory = path.join(local, "EverGreen/owner-keys");
function protect(bytes) {
  const script =
    "Add-Type -AssemblyName System.Security; $b=[Convert]::FromBase64String([Console]::In.ReadToEnd().Trim()); [Console]::Out.Write([Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)))";
  return Buffer.from(
    execFileSync(
      powershell,
      ["-NoProfile", "-NonInteractive", "-Command", script],
      {
        input: bytes.toString("base64"),
        encoding: "utf8",
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
      },
    ).trim(),
    "base64",
  );
}
function restrict(file, isDirectory = false) {
  const sid = execFileSync(
    powershell,
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "[Security.Principal.WindowsIdentity]::GetCurrent().User.Value",
    ],
    { encoding: "utf8", windowsHide: true },
  ).trim();
  execFileSync(
    path.join(process.env.SystemRoot || "C:\\Windows", "System32/icacls.exe"),
    [
      file,
      "/inheritance:r",
      "/grant:r",
      `*${sid}:${isDirectory ? "(OI)(CI)" : ""}F`,
    ],
    { stdio: "pipe", windowsHide: true },
  );
}
function stopProjectApis() {
  execFileSync(
    powershell,
    [
      "-NoProfile",
      "-NonInteractive",
      "-File",
      path.join(__dirname, "stop-owner-services.ps1"),
      "-ProjectRoot",
      root,
    ],
    { stdio: "pipe", windowsHide: true },
  );
}
async function start(config) {
  for (const [app, port] of [
    ["api", 4301],
    ["admin-api", 4300],
  ]) {
    // Stop-Process can return before the listening socket has closed.
    let released = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      const listening = await new Promise((resolve) => {
        const socket = require("node:net").connect(port, "127.0.0.1");
        socket.setTimeout(500);
        socket.once("connect", () => {
          socket.destroy();
          resolve(true);
        });
        socket.once("error", () => {
          socket.destroy();
          resolve(false);
        });
        socket.once("timeout", () => {
          socket.destroy();
          resolve(true);
        });
      });
      if (!listening) {
        released = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!released)
      throw new Error(`API port ${port} was not released; restart aborted`);
    const out = fs.openSync(path.join(directory, `${app}.log`), "a");
    const child = spawn(
      process.execPath,
      [path.join(root, "apps", app, "dist/main.js")],
      {
        cwd: path.join(root, "apps", app),
        env: {
          ...process.env,
          EVERGREEN_OWNER_RUNTIME_FILE: configFile,
          EVERGREEN_API_HOST: "127.0.0.1",
          EVERGREEN_API_PORT: String(port),
          ADMIN_API_PORT: String(port),
          AUTO_MIGRATE: "false",
        },
        detached: true,
        windowsHide: true,
        stdio: ["ignore", out, out],
      },
    );
    child.unref();
    fs.closeSync(out);
    let healthy = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      if (child.exitCode !== null || child.signalCode !== null)
        throw new Error(`New ${app} process exited during startup`);
      try {
        const response = await fetch(
          `http://127.0.0.1:${port}/license/status`,
          { signal: AbortSignal.timeout(1500) },
        );
        const state = await response.json();
        if (response.ok && state.active === true) {
          healthy = true;
          break;
        }
      } catch {
        /* Wait for bootstrap. */
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!healthy)
      throw new Error(
        `${app} did not verify its licence; inspect the private owner-host log`,
      );
  }
  console.log(
    JSON.stringify(
      {
        status: "Owner-hosted APIs verified",
        tenant: "http://127.0.0.1:4301",
        provider: "http://127.0.0.1:4300",
        databaseDirectory: path.dirname(config.DATABASE_URL.slice(5)),
        databaseEncryption:
          "Not enabled: Windows EFS is unavailable; protect the owner host and use encrypted production storage.",
      },
      null,
      2,
    ),
  );
}
async function main() {
  if (process.platform !== "win32")
    throw new Error(
      "This owner-host bootstrap is for the owner Windows workstation",
    );
  for (const plane of ["tenant", "provider"]) requireInstallationLicence(plane);
  const command = process.argv[2];
  if (command === "start") {
    const config = JSON.parse(
      unprotectOwnerData(
        fs.readFileSync(configFile).toString("base64"),
      ).toString("utf8"),
    );
    stopProjectApis();
    await start(config);
    return;
  }
  if (command !== "activate")
    throw new Error("Use activate once, then start for subsequent restarts");
  if (fs.existsSync(configFile))
    throw new Error("Owner-host configuration already exists; use start");
  for (const app of ["api", "admin-api"])
    if (!fs.existsSync(path.join(root, "apps", app, "dist/main.js")))
      throw new Error("Build both APIs before activation");
  const providerKey = unprotectOwnerData(
    fs
      .readFileSync(path.join(keyDirectory, "provider-access-key.dpapi"))
      .toString("base64"),
  ).toString("utf8");
  fs.mkdirSync(directory, { recursive: true });
  restrict(directory, true);
  const generation = path.join(directory, "data", randomUUID());
  fs.mkdirSync(generation, { recursive: true });
  // Stop only verified processes from this checkout before taking the final consistent snapshots.
  stopProjectApis();
  const tenant = path.join(generation, "tenant.db"),
    provider = path.join(generation, "provider.db");
  const sources = [
    path.join(root, "packages/database/prisma/dev.db"),
    path.join(root, "packages/admin-database/prisma/admin.db"),
  ];
  await snapshot(root, sources[0], tenant, "tenant");
  await snapshot(root, sources[1], provider, "provider");
  const config = {
    DATABASE_URL: "file:" + tenant.replaceAll("\\", "/"),
    ADMIN_DATABASE_URL: "file:" + provider.replaceAll("\\", "/"),
    ADMIN_API_KEY: providerKey,
    TENANT_JWT_SECRET: randomBytes(48).toString("hex"),
    PROVIDER_JWT_SECRET: randomBytes(48).toString("hex"),
    ENCRYPTION_SECRET:
      process.env.ENCRYPTION_SECRET || randomBytes(48).toString("hex"),
    EVERGREEN_OWNER_KEY_DIRECTORY: keyDirectory,
  };
  fs.writeFileSync(configFile, protect(Buffer.from(JSON.stringify(config))), {
    flag: "wx",
    mode: 0o600,
  });
  // Keep original databases for recovery, but remove broad inherited file access. Never delete them.
  for (const source of sources)
    for (const suffix of ["", "-wal", "-shm", "-journal"])
      if (fs.existsSync(source + suffix)) restrict(source + suffix);
  await start(config);
}
if (require.main === module)
  main().catch(() => {
    console.error(
      "Owner-host operation failed. Original databases are retained. Check the target ports, licence activation, generated clients and private logs before retrying.",
    );
    process.exitCode = 1;
  });
