const { spawn } = require("node:child_process");
const path = require("node:path");
const {
  requireInstallationLicence,
  ownerHostEnvironment,
} = require("../../packages/types/dist/licensing.js");
const plane = process.argv[2];
if (!["tenant", "provider"].includes(plane))
  throw new Error("Choose tenant or provider");
const licence = requireInstallationLicence("provider");
if (!licence.roles.includes("ADMIN"))
  throw new Error("Owner ADMIN installation scope required");
const environment = ownerHostEnvironment(plane);
if (
  !(plane === "tenant"
    ? environment.DATABASE_URL
    : environment.ADMIN_DATABASE_URL)
)
  throw new Error("Owner private runtime configuration is required");
const root = path.resolve(__dirname, "../..");
const schema = path.join(
  root,
  "packages",
  plane === "tenant" ? "database" : "admin-database",
  "prisma/schema.prisma",
);
const child = spawn(
  process.execPath,
  [
    path.join(root, "node_modules/prisma/build/index.js"),
    "studio",
    "--schema",
    schema,
    "--hostname",
    "127.0.0.1",
    "--port",
    plane === "tenant" ? "5555" : "5556",
    "--browser",
    "none",
  ],
  {
    cwd: root,
    env: { ...process.env, ...environment },
    stdio: "inherit",
    windowsHide: true,
  },
);
console.log(
  `Owner-only ${plane} Prisma Studio: http://127.0.0.1:${plane === "tenant" ? "5555" : "5556"}. Stop with Ctrl+C. Snapshot before editing data.`,
);
child.on("error", () => {
  console.error("Prisma Studio could not start.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code || 0;
});
