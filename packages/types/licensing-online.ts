import {
  constants,
  createCipheriv,
  publicEncrypt,
  randomBytes,
  sign,
  verify,
  createPrivateKey,
  createPublicKey,
} from "node:crypto";
import { readFileSync, existsSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { OWNER_PUBLIC_KEY } from "./owner-public-key";
import {
  decodeEncryptedLicence,
  installationId,
  readInstallationPrivateKey,
  readLicenceEnvelope,
  unprotectOwnerData,
  verifyInstallationLicence,
  type InstallationLicence,
  type LicensedPlane,
} from "./licensing";

export interface LeaseRequest {
  licence: unknown;
  plane: LicensedPlane;
  nonce: string;
  time: number;
  proof: string;
}
export interface OnlineGrant {
  claims: InstallationLicence;
  publicKey: string;
  offlineDays: number;
}
const message = (request: Omit<LeaseRequest, "proof">) =>
  Buffer.from(JSON.stringify(request));

/** Renewal may recover an expired offline window, but never an expired subscription. */
function renewalClaims(
  envelope: unknown,
  plane: LicensedPlane,
  binding: string,
  now: number,
  signingPublicKey = OWNER_PUBLIC_KEY,
): InstallationLicence {
  const encoded = (envelope as { payload: string }).payload;
  if (typeof encoded !== "string" || encoded.length > 8192)
    throw new Error("Invalid licence");
  const untrusted = JSON.parse(
    Buffer.from(encoded, "base64url").toString("utf8"),
  ) as InstallationLicence;
  const claims = verifyInstallationLicence(
    envelope,
    signingPublicKey,
    plane,
    binding,
    Math.min(now, Date.parse(untrusted.offlineUntil) - 1),
  );
  if (Date.parse(claims.issuedAt) > now || Date.parse(claims.expiresAt) <= now)
    throw new Error("Subscription expired");
  return claims;
}

export function validateLeaseRequest(
  request: LeaseRequest,
  grant: OnlineGrant,
  now = Date.now(),
  signingPublicKey = OWNER_PUBLIC_KEY,
): InstallationLicence {
  if (
    !request ||
    !["tenant", "provider"].includes(request.plane) ||
    !/^[A-Za-z0-9_-]{43}$/.test(request.nonce) ||
    !Number.isFinite(request.time) ||
    Math.abs(request.time - now) > 300000 ||
    typeof request.proof !== "string" ||
    request.proof.length > 1024
  )
    throw new Error("Invalid renewal proof");
  const claims = renewalClaims(
    request.licence,
    request.plane,
    grant.claims.installationId,
    now,
    signingPublicKey,
  );
  if (
    claims.licenceId !== grant.claims.licenceId ||
    Date.parse(grant.claims.expiresAt) <= now ||
    !grant.claims.planes.includes(request.plane)
  )
    throw new Error("Grant is not active");
  const { proof, ...unsigned } = request;
  const key = createPublicKey(grant.publicKey);
  if (
    key.asymmetricKeyType !== "rsa" ||
    !verify(
      "sha256",
      message(unsigned),
      { key, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 },
      Buffer.from(proof, "base64url"),
    )
  )
    throw new Error("Invalid installation proof");
  return grant.claims;
}

export function sealLease(
  claims: InstallationLicence,
  publicKey: string,
  signingKey: ReturnType<typeof createPrivateKey>,
) {
  const payload = Buffer.from(JSON.stringify(claims));
  const envelope = Buffer.from(
    JSON.stringify({
      payload: payload.toString("base64url"),
      signature: sign(null, payload, signingKey).toString("base64url"),
    }),
  );
  const key = randomBytes(32),
    iv = randomBytes(12);
  try {
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const data = Buffer.concat([cipher.update(envelope), cipher.final()]);
    return {
      protection: "sealed-v1",
      data: data.toString("base64"),
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      wrappedKey: publicEncrypt(
        {
          key: publicKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        key,
      ).toString("base64"),
    };
  } finally {
    key.fill(0);
  }
}

/** Owner-side registry is outside all application databases. Missing grants and revocations fail closed. */
const seen = new Map<string, number>();
export function issueOnlineLease(request: LeaseRequest) {
  const encoded = (request?.licence as { payload?: string })?.payload;
  if (typeof encoded !== "string" || encoded.length > 8192)
    throw new Error("Invalid renewal");
  const id = (
    JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as InstallationLicence
  ).licenceId;
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id))
    throw new Error("Invalid renewal");
  const directory = process.env.EVERGREEN_OWNER_KEY_DIRECTORY;
  if (!directory) throw new Error("Online issuer is not configured");
  if (existsSync(join(directory, "grants", `${id}.revoked`)))
    throw new Error("Licence is revoked");
  const grant = JSON.parse(
    unprotectOwnerData(
      readFileSync(join(directory, "grants", `${id}.dpapi`)).toString("base64"),
    ).toString("utf8"),
  ) as OnlineGrant;
  const now = Date.now();
  const claims = validateLeaseRequest(request, grant, now);
  for (const [nonce, time] of seen) if (time < now - 300000) seen.delete(nonce);
  const replayKey = `${id}:${request.nonce}`;
  if (seen.has(replayKey) || seen.size >= 10000)
    throw new Error("Renewal proof already used or issuer busy");
  seen.set(replayKey, now);
  const pem = unprotectOwnerData(
    readFileSync(join(directory, "owner-signing-key.dpapi")).toString("base64"),
  );
  try {
    const key = createPrivateKey(pem);
    if (
      createPublicKey(key).export({ type: "spki", format: "pem" }) !==
      OWNER_PUBLIC_KEY
    )
      throw new Error("Issuer key mismatch");
    return sealLease(
      {
        ...claims,
        issuedAt: new Date(now).toISOString(),
        offlineUntil: new Date(
          Math.min(
            Date.parse(claims.expiresAt),
            now + grant.offlineDays * 86400000,
          ),
        ).toISOString(),
      },
      grant.publicKey,
      key,
    );
  } finally {
    pem.fill(0);
  }
}

let pending: Promise<void> | undefined;
/** Only a configured owner endpoint is contacted. A network failure never extends signed offline access. */
export function refreshInstallationLease(plane: LicensedPlane): Promise<void> {
  if (pending) return pending;
  pending = (async () => {
    if (!process.env.EVERGREEN_LICENSE_RENEWAL_URL) return;
    const url = new URL(process.env.EVERGREEN_LICENSE_RENEWAL_URL);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hash ||
      url.search
    )
      throw new Error("Licence renewal requires an HTTPS owner endpoint");
    const licence = readLicenceEnvelope(plane);
    renewalClaims(licence, plane, installationId(), Date.now());
    const unsigned = {
      licence,
      plane,
      nonce: randomBytes(32).toString("base64url"),
      time: Date.now(),
    };
    const pem = readInstallationPrivateKey();
    let proof: string;
    try {
      proof = sign("sha256", message(unsigned), {
        key: pem,
        padding: constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      }).toString("base64url");
    } finally {
      pem.fill(0);
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...unsigned, proof }),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error("Renewal was not authorized");
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Empty renewal response");
    let body = "",
      size = 0;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 16384) throw new Error("Oversized renewal response");
        body += Buffer.from(value).toString("utf8");
      }
    } finally {
      await reader.cancel();
    }
    const encrypted = JSON.parse(body) as ReturnType<typeof sealLease>;
    verifyInstallationLicence(
      decodeEncryptedLicence(encrypted),
      OWNER_PUBLIC_KEY,
      plane,
      installationId(),
    );
    const file =
      process.env.EVERGREEN_LICENSE_FILE ||
      join(homedir(), ".evergreen", "licenses", `${plane}.json`);
    const temporary = `${file}.${randomBytes(8).toString("hex")}.tmp`;
    writeFileSync(temporary, JSON.stringify(encrypted), {
      flag: "wx",
      mode: 0o600,
    });
    renameSync(temporary, file);
  })().finally(() => {
    pending = undefined;
  });
  return pending;
}
