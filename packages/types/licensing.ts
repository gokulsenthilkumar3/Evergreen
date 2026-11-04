import {
  createHash,
  createPublicKey,
  verify,
  createDecipheriv,
  privateDecrypt,
  constants,
} from "node:crypto";
import { readFileSync, statSync, existsSync } from "node:fs";
import { hostname, homedir, platform, userInfo } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { OWNER_PUBLIC_KEY } from "./owner-public-key";

export type LicensedPlane = "tenant" | "provider";
export interface InstallationLicence {
  version: 1;
  application: "evergreen";
  licenceId: string;
  owner: string;
  installationId: string;
  planes: LicensedPlane[];
  issuedAt: string;
  expiresAt: string;
  offlineUntil: string;
  roles: Array<"VIEWER" | "MODIFIER" | "ADMIN">;
}

/** Deployment binding, not a hardware security boundary. Host administrators can spoof or patch it. */
export function installationId(): string {
  return createHash("sha256")
    .update(JSON.stringify([platform(), hostname(), userInfo().username]))
    .digest("hex");
}

export function verifyInstallationLicence(
  envelope: unknown,
  publicKey: string,
  plane: LicensedPlane,
  expectedInstallationId: string,
  now = Date.now(),
): InstallationLicence {
  if (!envelope || typeof envelope !== "object")
    throw new Error("Invalid installation licence");
  const { payload, signature } = envelope as {
    payload?: unknown;
    signature?: unknown;
  };
  if (
    typeof payload !== "string" ||
    payload.length > 8192 ||
    !/^[A-Za-z0-9_-]+$/.test(payload) ||
    typeof signature !== "string" ||
    !/^[A-Za-z0-9_-]{86}$/.test(signature)
  )
    throw new Error("Invalid installation licence");
  const key = createPublicKey(publicKey);
  if (
    key.asymmetricKeyType !== "ed25519" ||
    !verify(
      null,
      Buffer.from(payload, "base64url"),
      key,
      Buffer.from(signature, "base64url"),
    )
  )
    throw new Error("Installation licence signature is invalid");
  const claims = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8"),
  ) as InstallationLicence;
  if (
    claims.version !== 1 ||
    claims.application !== "evergreen" ||
    typeof claims.licenceId !== "string" ||
    !claims.licenceId ||
    typeof claims.owner !== "string" ||
    !claims.owner ||
    !Array.isArray(claims.planes) ||
    !claims.planes.length ||
    claims.planes.some((value) => value !== "tenant" && value !== "provider") ||
    !claims.planes.includes(plane) ||
    !Array.isArray(claims.roles) ||
    !claims.roles.length ||
    claims.roles.some(
      (role) => !["VIEWER", "MODIFIER", "ADMIN"].includes(role),
    ) ||
    claims.installationId !== expectedInstallationId
  )
    throw new Error(
      "Installation licence does not authorize this installation or API plane",
    );
  const issued = Date.parse(claims.issuedAt),
    expires = Date.parse(claims.expiresAt),
    offline = Date.parse(claims.offlineUntil);
  if (
    !Number.isFinite(issued) ||
    !Number.isFinite(expires) ||
    !Number.isFinite(offline) ||
    offline > expires ||
    offline <= issued ||
    expires <= issued ||
    issued > now ||
    now >= expires ||
    now >= offline
  )
    throw new Error("Installation licence is expired or not yet valid");
  return claims;
}

let cached: { digest: string; envelope: unknown } | undefined;
export function unprotectOwnerData(data: string): Buffer {
  if (platform() !== "win32")
    throw new Error("This activation is encrypted for a Windows account");
  const script =
    "Add-Type -AssemblyName System.Security; $b=[Convert]::FromBase64String([Console]::In.ReadToEnd().Trim()); $r=[Security.Cryptography.ProtectedData]::Unprotect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($r))";
  const encoded = execFileSync(
    join(
      process.env.SystemRoot || "C:\\Windows",
      "System32/WindowsPowerShell/v1.0/powershell.exe",
    ),
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      input: data,
      encoding: "utf8",
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  return Buffer.from(encoded.trim(), "base64");
}
export function readInstallationPrivateKey(): Buffer {
  const file =
    process.env.EVERGREEN_INSTALLATION_KEY_FILE ||
    join(homedir(), ".evergreen", "licenses", "installation-key.json");
  const info = statSync(file);
  if (
    info.size > 16384 ||
    (platform() !== "win32" && (info.mode & 0o077) !== 0)
  )
    throw new Error("Installation key permissions must be owner-only");
  const stored = JSON.parse(readFileSync(file, "utf8")) as {
    protection: string;
    data: string;
  };
  if (stored.protection === "windows-dpapi-current-user")
    return unprotectOwnerData(stored.data);
  if (platform() !== "win32" && stored.protection === "unix-file-permissions")
    return Buffer.from(stored.data, "base64");
  throw new Error("Invalid installation encryption key");
}
export function decodeEncryptedLicence(stored: {
  protection?: string;
  data?: string;
  wrappedKey?: string;
  iv?: string;
  tag?: string;
}): unknown {
  if (typeof stored.data !== "string")
    throw new Error("An encrypted installation licence is required");
  let plaintext: Buffer;
  if (stored.protection === "windows-dpapi-current-user")
    plaintext = unprotectOwnerData(stored.data);
  else if (stored.protection === "sealed-v1") {
    const pem = readInstallationPrivateKey();
    try {
      const key = privateDecrypt(
        {
          key: pem,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(stored.wrappedKey || "", "base64"),
      );
      try {
        const decipher = createDecipheriv(
          "aes-256-gcm",
          key,
          Buffer.from(stored.iv || "", "base64"),
        );
        decipher.setAuthTag(Buffer.from(stored.tag || "", "base64"));
        plaintext = Buffer.concat([
          decipher.update(Buffer.from(stored.data, "base64")),
          decipher.final(),
        ]);
      } finally {
        key.fill(0);
      }
    } finally {
      pem.fill(0);
    }
  } else throw new Error("An encrypted installation licence is required");
  try {
    return JSON.parse(plaintext.toString("utf8")) as unknown;
  } finally {
    plaintext.fill(0);
  }
}
function readProtectedLicence(file: string): unknown {
  const bytes = readFileSync(file);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (cached?.digest === digest) return cached.envelope;
  const stored = JSON.parse(bytes.toString("utf8")) as {
    protection?: string;
    data?: string;
    wrappedKey: string;
    iv: string;
    tag: string;
  };
  const envelope = decodeEncryptedLicence(stored);
  cached = { digest, envelope };
  return envelope;
}
export function readLicenceEnvelope(plane: LicensedPlane): unknown {
  return readProtectedLicence(
    process.env.EVERGREEN_LICENSE_FILE ||
      join(homedir(), ".evergreen", "licenses", `${plane}.json`),
  );
}

/** No database flag, NODE_ENV bypass, or environment-supplied verification key. */
export function requireInstallationLicence(
  plane: LicensedPlane,
): InstallationLicence {
  if (!OWNER_PUBLIC_KEY)
    throw new Error("Owner verification key has not been provisioned");
  const file =
    process.env.EVERGREEN_LICENSE_FILE ||
    join(homedir(), ".evergreen", "licenses", `${plane}.json`);
  if (statSync(file).size > 16384)
    throw new Error("Invalid installation licence");
  return verifyInstallationLicence(
    readProtectedLicence(file),
    OWNER_PUBLIC_KEY,
    plane,
    installationId(),
  );
}

/** Owner-hosted Windows configuration stays encrypted outside the source checkout. */
export function ownerHostEnvironment(
  plane: LicensedPlane,
): Record<string, string> {
  if (platform() !== "win32") return {};
  const file =
    process.env.EVERGREEN_OWNER_RUNTIME_FILE ||
    join(
      process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local"),
      "EverGreen",
      "owner-host",
      "runtime.dpapi",
    );
  if (!existsSync(file)) return {};
  const stored = JSON.parse(
    unprotectOwnerData(readFileSync(file).toString("base64")).toString("utf8"),
  ) as Record<string, string>;
  if (plane === "tenant")
    return {
      DATABASE_URL: stored.DATABASE_URL,
      JWT_SECRET: stored.TENANT_JWT_SECRET,
      ENCRYPTION_SECRET: stored.ENCRYPTION_SECRET,
      EVERGREEN_API_HOST: "127.0.0.1",
    };
  return {
    ADMIN_DATABASE_URL: stored.ADMIN_DATABASE_URL,
    ADMIN_API_KEY: stored.ADMIN_API_KEY,
    JWT_SECRET: stored.PROVIDER_JWT_SECRET,
    EVERGREEN_OWNER_KEY_DIRECTORY: stored.EVERGREEN_OWNER_KEY_DIRECTORY,
    EVERGREEN_API_HOST: "127.0.0.1",
  };
}
