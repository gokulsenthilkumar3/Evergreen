const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { randomUUID } = require("node:crypto");
const {
  ownerHostEnvironment,
  requireInstallationLicence,
} = require("../../packages/types/dist/licensing.js");
const root = path.resolve(__dirname, "../..");
async function main() {
  requireInstallationLicence("tenant");
  const env = { ...process.env, ...ownerHostEnvironment("tenant") };
  if (!env.DATABASE_URL?.startsWith("file:"))
    throw new Error("Private owner database is required");
  const source = env.DATABASE_URL.slice(5);
  const directory = path.dirname(source);
  if (
    path
      .resolve(source)
      .toLowerCase()
      .startsWith(root.toLowerCase() + path.sep)
  )
    throw new Error("Expected private owner storage outside the checkout");
  const backup = path.join(directory, `before-support-${randomUUID()}.db`);
  const applied = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "-e",
        `const {PrismaClient}=require('@prisma/client'); const db=new PrismaClient(); db.$queryRawUnsafe('SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations').then(rows=>process.stdout.write(JSON.stringify(rows))).finally(()=>db.$disconnect());`,
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
  if (applied.some((row) => !row.finished_at && !row.rolled_back_at))
    throw new Error("An earlier migration needs investigation");
  const completed = new Set(
    applied
      .filter((row) => row.finished_at && !row.rolled_back_at)
      .map((row) => row.migration_name),
  );
  const pending = fs
    .readdirSync(path.join(root, "packages/database/prisma/migrations"), {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory() && !completed.has(entry.name))
    .map((entry) => entry.name);
  if (pending.some((name) => name !== "20261101000100_support_tickets"))
    throw new Error("Unexpected pending migration; inspect before applying");
  const powershell = path.join(
    process.env.SystemRoot || "C:/Windows",
    "System32/WindowsPowerShell/v1.0/powershell.exe",
  );
  execFileSync(
    powershell,
    [
      "-NoProfile",
      "-NonInteractive",
      "-File",
      path.join(root, "scripts/security/stop-owner-services.ps1"),
      "-ProjectRoot",
      root,
    ],
    { stdio: "pipe", windowsHide: true },
  );
  // Run snapshot in a child so its Prisma DLL is unloaded before generating clients.
  execFileSync(
    process.execPath,
    [
      path.join(root, "scripts/release/database.cjs"),
      "snapshot",
      "tenant",
      source,
      backup,
    ],
    { cwd: root, env, stdio: "pipe", windowsHide: true },
  );
  if (!fs.existsSync(backup))
    throw new Error("Verified snapshot was not created");
  for (const schema of [
    "packages/database/prisma/schema.prisma",
    "packages/admin-database/prisma/schema.prisma",
  ])
    execFileSync(
      process.execPath,
      [
        path.join(root, "node_modules/prisma/build/index.js"),
        "generate",
        "--schema",
        schema,
      ],
      { cwd: root, env, stdio: "pipe", windowsHide: true },
    );
  execFileSync(
    process.execPath,
    [
      path.join(root, "node_modules/prisma/build/index.js"),
      "migrate",
      "deploy",
      "--schema",
      "packages/database/prisma/schema.prisma",
    ],
    { cwd: root, env, stdio: "pipe", windowsHide: true },
  );
  console.log(
    JSON.stringify({
      migration: "Tenant migrations applied after verified private snapshot",
      backup,
      sourceData: "retained",
    }),
  );
}
main().catch(() => {
  console.error(
    "Owner database upgrade did not complete. Original data and any completed snapshot were retained; inspect migration status before restarting.",
  );
  process.exitCode = 1;
});
