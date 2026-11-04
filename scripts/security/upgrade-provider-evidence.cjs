// Additive owner-database upgrade. No business rows or original files are removed.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { randomUUID } = require("node:crypto");
const {
  ownerHostEnvironment,
  requireInstallationLicence,
} = require("../../packages/types/dist/licensing");
const root = path.resolve(__dirname, "../..");
async function main() {
  requireInstallationLicence("provider");
  const env = { ...process.env, ...ownerHostEnvironment("provider") };
  if (!env.ADMIN_DATABASE_URL?.startsWith("file:"))
    throw Error("Private provider database required");
  const source = path.resolve(env.ADMIN_DATABASE_URL.slice(5));
  if (
    source.toLowerCase().startsWith(root.toLowerCase() + path.sep) ||
    !fs.existsSync(source)
  )
    throw Error("Expected existing private provider storage");
  const applied = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "-e",
        "const {PrismaClient}=require('@prisma/admin-client');const db=new PrismaClient();db.$queryRawUnsafe('SELECT migration_name,finished_at,rolled_back_at FROM _prisma_migrations').then(r=>process.stdout.write(JSON.stringify(r))).finally(()=>db.$disconnect())",
      ],
      {
        cwd: root,
        env,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    ),
  );
  if (applied.some((r) => !r.finished_at && !r.rolled_back_at))
    throw Error("Resolve earlier incomplete migration first");
  const complete = new Set(
    applied
      .filter((r) => r.finished_at && !r.rolled_back_at)
      .map((r) => r.migration_name),
  );
  const pending = fs
    .readdirSync(path.join(root, "packages/admin-database/prisma/migrations"), {
      withFileTypes: true,
    })
    .filter((e) => e.isDirectory() && !complete.has(e.name))
    .map((e) => e.name);
  if (pending.some((name) => name !== "20261101010000_evidence_ledger"))
    throw Error("Unexpected pending provider migration");
  const ps = path.join(
    process.env.SystemRoot,
    "System32/WindowsPowerShell/v1.0/powershell.exe",
  );
  execFileSync(
    ps,
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "$expected='" +
        path.join(root, "apps/admin-api/dist/main.js").replaceAll("'", "''") +
        "'; Get-CimInstance Win32_Process -Filter \"Name = 'node.exe'\" | Where-Object { ([string]$_.CommandLine).Replace('/','\\').Contains($expected) } | ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction Stop }",
    ],
    { stdio: "pipe", windowsHide: true },
  );
  const backup = path.join(
    path.dirname(source),
    "before-evidence-" + randomUUID() + ".db",
  );
  execFileSync(
    process.execPath,
    [
      path.join(root, "scripts/release/database.cjs"),
      "snapshot",
      "provider",
      source,
      backup,
    ],
    { cwd: root, env, stdio: "pipe", windowsHide: true },
  );
  if (!fs.existsSync(backup) || !fs.existsSync(backup + ".json"))
    throw Error("Verified backup is missing");
  const prisma = path.join(root, "node_modules/prisma/build/index.js");
  execFileSync(
    process.execPath,
    [
      prisma,
      "generate",
      "--schema",
      "packages/admin-database/prisma/schema.prisma",
    ],
    { cwd: root, env, stdio: "pipe", windowsHide: true },
  );
  execFileSync(
    process.execPath,
    [
      prisma,
      "migrate",
      "deploy",
      "--schema",
      "packages/admin-database/prisma/schema.prisma",
    ],
    { cwd: root, env, stdio: "pipe", windowsHide: true },
  );
  console.log(
    JSON.stringify({
      status: "Additive provider migration applied",
      backup,
      original: "retained",
    }),
  );
}
main().catch((error) => {
  console.error(
    "Provider evidence upgrade stopped: " +
      error.message +
      ". Original database and any completed backup are retained.",
  );
  process.exitCode = 1;
});
