"use strict";
// Owner workstation only. No private key is written into source, a licence, or terminal output.
const fs = require("node:fs");
const path = require("node:path");
const {
  generateKeyPairSync,
  createPrivateKey,
  createPublicKey,
  sign,
  randomUUID,
  randomBytes,
  createCipheriv,
  publicEncrypt,
  constants,
} = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { installationId } = require("../../packages/types/dist/licensing.js");
const root = path.resolve(__dirname, "../..");
const publicSource = path.join(root, "packages/types/owner-public-key.ts");
const powershell = path.join(
  process.env.SystemRoot || "C:\\Windows",
  "System32/WindowsPowerShell/v1.0/powershell.exe",
);

function dpapi(bytes, decrypt = false) {
  if (process.platform !== "win32")
    throw new Error("Owner key operations require the owner Windows account");
  const operation = decrypt ? "Unprotect" : "Protect";
  const script = `Add-Type -AssemblyName System.Security; $b=[Convert]::FromBase64String([Console]::In.ReadToEnd().Trim()); $r=[Security.Cryptography.ProtectedData]::${operation}($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($r))`;
  const result = execFileSync(
    powershell,
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      input: bytes.toString("base64"),
      encoding: "utf8",
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  return Buffer.from(result.trim(), "base64");
}

function writeLicence(
  privateKey,
  directory,
  plane,
  days,
  offlineDays,
  roles,
  binding,
  recipientKey,
  keyDir,
) {
  const now = Date.now();
  const claims = {
    version: 1,
    application: "evergreen",
    licenceId: randomUUID(),
    owner: "EverGreen owner",
    installationId: binding,
    planes: [plane],
    roles,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + days * 86400000).toISOString(),
    offlineUntil: new Date(now + offlineDays * 86400000).toISOString(),
  };
  const payload = Buffer.from(JSON.stringify(claims));
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, `${plane}.json`);
  // Never replace an existing licence silently; renewal uses a fresh output directory.
  const envelope = Buffer.from(
    JSON.stringify({
      payload: payload.toString("base64url"),
      signature: sign(null, payload, privateKey).toString("base64url"),
    }),
  );
  // Activation is for this Windows account; transport to another machine requires activation there.
  let stored;
  if (recipientKey) {
    const key = randomBytes(32),
      iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(envelope), cipher.final()]);
    stored = {
      protection: "sealed-v1",
      wrappedKey: publicEncrypt(
        {
          key: recipientKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        key,
      ).toString("base64"),
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      data: ciphertext.toString("base64"),
    };
    key.fill(0);
  } else
    stored = {
      protection: "windows-dpapi-current-user",
      data: dpapi(envelope).toString("base64"),
    };
  fs.writeFileSync(file, JSON.stringify(stored, null, 2), {
    flag: "wx",
    mode: 0o600,
  });
  if (recipientKey) {
    const grants = path.join(keyDir, "grants");
    fs.mkdirSync(grants, { recursive: true });
    const record = Buffer.from(
      JSON.stringify({
        claims,
        publicKey: recipientKey.export({ type: "spki", format: "pem" }),
        offlineDays,
      }),
    );
    fs.writeFileSync(
      path.join(grants, `${claims.licenceId}.dpapi`),
      dpapi(record),
      { flag: "wx", mode: 0o600 },
    );
  }
  return {
    file,
    licenceId: claims.licenceId,
    expiresAt: claims.expiresAt,
    offlineUntil: claims.offlineUntil,
  };
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help') {
    console.log([
      'EverGreen owner licensing (run from the repository root)',
      'id: print this installation identifier',
      'request --license-dir PATH: create a public installation request; keep the private installation key there',
      'issue --key-dir OWNER_KEYS --license-dir FRESH_OUTPUT [--request REQUEST_JSON] --days 30 --offline-days 3 --roles VIEWER,MODIFIER,ADMIN',
      'revoke --key-dir OWNER_KEYS --licence-id ID: stop online renewal; existing offline allowance remains valid until its signed deadline',
      'show-provider-key --key-dir OWNER_KEYS: show your provider sign-in credential in your own terminal',
      'Guide: docs/OWNER_LICENSING.md',
      'Tamil digits are accepted for durations. The owner signing key is never displayed.',
    ].join('\n'));
    return;
  }
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (
      ![
        "--key-dir",
        "--license-dir",
        "--days",
        "--offline-days",
        "--roles",
        "--installation-id",
        "--request",
        "--licence-id",
      ].includes(args[i]) ||
      !args[i + 1]
    )
      throw new Error("Invalid owner licence arguments");
    options[args[i]] = args[i + 1];
  }
  if (command === "id") {
    console.log(installationId());
    return;
  }
  if (command === "provider-key" || command === "show-provider-key") {
    if (!options["--key-dir"])
      throw new Error("Supply the owner key directory");
    const directory = path.resolve(options["--key-dir"]);
    if (directory === root || directory.startsWith(root + path.sep))
      throw new Error("Store credentials outside the repository");
    const file = path.join(directory, "provider-access-key.dpapi");
    if (command === "show-provider-key") {
      console.log(dpapi(fs.readFileSync(file), true).toString("utf8"));
      return;
    }
    fs.mkdirSync(directory, { recursive: true });
    const key = randomBytes(48).toString("base64url");
    fs.writeFileSync(file, dpapi(Buffer.from(key)), {
      flag: "wx",
      mode: 0o600,
    });
    console.log(
      JSON.stringify({
        file,
        instruction:
          "Generated a protected provider credential. Use show-provider-key in your own terminal when signing in; never put it in VITE variables.",
      }),
    );
    return;
  }
  if (command === "request") {
    if (!options["--license-dir"])
      throw new Error("Supply the target installation licence directory");
    const directory = path.resolve(options["--license-dir"]);
    if (directory === root || directory.startsWith(root + path.sep))
      throw new Error("Store installation keys outside the repository");
    for (const file of ["installation-key.json", "installation-request.json"])
      if (fs.existsSync(path.join(directory, file)))
        throw new Error("Installation request already exists");
    const pair = generateKeyPairSync("rsa", { modulusLength: 3072 });
    const encoded = Buffer.from(
      pair.privateKey.export({ type: "pkcs8", format: "pem" }),
    );
    const stored =
      process.platform === "win32"
        ? {
            protection: "windows-dpapi-current-user",
            data: dpapi(encoded).toString("base64"),
          }
        : {
            protection: "unix-file-permissions",
            data: encoded.toString("base64"),
          };
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    fs.writeFileSync(
      path.join(directory, "installation-key.json"),
      JSON.stringify(stored),
      { flag: "wx", mode: 0o600 },
    );
    encoded.fill(0);
    const file = path.join(directory, "installation-request.json");
    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          version: 1,
          installationId: installationId(),
          publicKey: pair.publicKey.export({ type: "spki", format: "pem" }),
        },
        null,
        2,
      ),
      { flag: "wx", mode: 0o600 },
    );
    console.log(
      JSON.stringify({
        request: file,
        instruction:
          "Send only installation-request.json to the owner. Retain installation-key.json privately on this installation.",
      }),
    );
    return;
  }
  if (command === "revoke") {
    if (
      !options["--key-dir"] ||
      !/^[a-f0-9-]{36}$/.test(options["--licence-id"] || "")
    )
      throw new Error("Supply the owner key directory and licence ID");
    const directory = path.resolve(options["--key-dir"]);
    const grant = path.join(
      directory,
      "grants",
      `${options["--licence-id"]}.dpapi`,
    );
    // Prove owner access before changing the grant registry.
    dpapi(fs.readFileSync(grant), true);
    fs.writeFileSync(
      path.join(directory, "grants", `${options["--licence-id"]}.revoked`),
      new Date().toISOString(),
      { flag: "wx", mode: 0o600 },
    );
    console.log(
      "Renewal revoked. Existing signed offline access ends at its offlineUntil deadline.",
    );
    return;
  }
  if (!["init", "issue"].includes(command))
    throw new Error("Use id, request, init, issue or revoke");
  const keyDir = path.resolve(options["--key-dir"] || "");
  const licenceDir = path.resolve(options["--license-dir"] || "");
  if (
    !options["--key-dir"] ||
    !options["--license-dir"] ||
    keyDir === root ||
    keyDir.startsWith(root + path.sep)
  )
    throw new Error(
      "Store the owner key outside the repository and supply a licence output directory",
    );
  const decimal = (value) =>
    Number(
      String(value).replace(/[\u0be6-\u0bef]/g, (digit) =>
        String(digit.charCodeAt(0) - 0x0be6),
      ),
    );
  const days = decimal(options["--days"] || 30);
  if (!Number.isInteger(days) || days < 1 || days > 366)
    throw new Error("Licence duration must be 1-366 days");
  const offlineDays = decimal(options["--offline-days"] || days);
  if (!Number.isInteger(offlineDays) || offlineDays < 1 || offlineDays > days)
    throw new Error("Offline period must be within the licence period");
  const roles = [
    ...new Set((options["--roles"] || "VIEWER,MODIFIER,ADMIN").split(",")),
  ];
  if (
    !roles.length ||
    roles.some((role) => !["VIEWER", "MODIFIER", "ADMIN"].includes(role))
  )
    throw new Error("Invalid staff roles");
  const request = options["--request"]
    ? JSON.parse(fs.readFileSync(options["--request"], "utf8"))
    : undefined;
  const recipientKey = request ? createPublicKey(request.publicKey) : undefined;
  if (
    request &&
    (request.version !== 1 ||
      recipientKey.asymmetricKeyType !== "rsa" ||
      recipientKey.asymmetricKeyDetails.modulusLength < 3072)
  )
    throw new Error("Invalid installation request");
  const binding =
    request?.installationId || options["--installation-id"] || installationId();
  if (!/^[a-f0-9]{64}$/.test(binding))
    throw new Error("Invalid installation ID");
  const keyFile = path.join(keyDir, "owner-signing-key.dpapi");
  // Check every output first so a refused run makes no changes.
  for (const plane of ["tenant", "provider"])
    if (fs.existsSync(path.join(licenceDir, `${plane}.json`)))
      throw new Error(
        "Licence output already exists; choose a fresh directory",
      );
  let privateKey;
  if (command === "init") {
    if (
      fs.existsSync(keyFile) ||
      !/OWNER_PUBLIC_KEY\s*=\s*['"]['"]/.test(
        fs.readFileSync(publicSource, "utf8"),
      )
    )
      throw new Error(
        "Owner key is already provisioned; use issue for new licences",
      );
    const pair = generateKeyPairSync("ed25519");
    const encoded = Buffer.from(
      pair.privateKey.export({ type: "pkcs8", format: "pem" }),
    );
    const protectedKey = dpapi(encoded);
    encoded.fill(0);
    fs.mkdirSync(keyDir, { recursive: true });
    fs.writeFileSync(keyFile, protectedKey, { flag: "wx", mode: 0o600 });
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
      [keyFile, "/inheritance:r", "/grant:r", `*${sid}:F`],
      { windowsHide: true, stdio: "pipe" },
    );
    fs.writeFileSync(
      publicSource,
      `/** Public verification key only; private signing key stays on the owner workstation. */\nexport const OWNER_PUBLIC_KEY = ${JSON.stringify(pair.publicKey.export({ type: "spki", format: "pem" }))};\n`,
    );
    privateKey = pair.privateKey;
  } else {
    const encoded = dpapi(fs.readFileSync(keyFile), true);
    try {
      privateKey = createPrivateKey(encoded);
    } finally {
      encoded.fill(0);
    }
    const expected =
      require("../../packages/types/dist/owner-public-key.js").OWNER_PUBLIC_KEY;
    if (
      createPublicKey(privateKey).export({ type: "spki", format: "pem" }) !==
      expected
    )
      throw new Error(
        "Owner signing key does not match this application build",
      );
  }
  if (!request && binding !== installationId())
    throw new Error(
      "Remote installations must supply an encrypted installation request",
    );
  const licences = ["tenant", "provider"].map((plane) =>
    writeLicence(
      privateKey,
      licenceDir,
      plane,
      days,
      offlineDays,
      roles,
      binding,
      recipientKey,
      keyDir,
    ),
  );
  const tamilNumber = (value) =>
    String(value).replace(/[0-9]/g, (digit) =>
      String.fromCharCode(0x0be6 + Number(digit)),
    );
  console.log(
    JSON.stringify(
      {
        ownerKey: keyFile,
        protection: "Windows DPAPI CurrentUser and owner-only file ACL",
        licences,
        days,
        daysTamil: tamilNumber(days),
        offlineDays,
        roles,
        rebuildRequired: command === "init",
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  try {
    main();
  } catch {
    console.error(
      "Owner licence operation failed. Check arguments, current Windows account, existing outputs and key provisioning. Existing files are retained.",
    );
    process.exitCode = 1;
  }
}
