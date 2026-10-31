const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  generateKeyPairSync,
  sign,
  constants,
  privateDecrypt,
  createDecipheriv,
} = require("node:crypto");
const {
  validateLeaseRequest,
  sealLease,
} = require("../../packages/types/dist/licensing-online.js");
const {
  decodeEncryptedLicence,
} = require("../../packages/types/dist/licensing.js");
const {
  verifyInstallationLicence,
} = require("../../packages/types/dist/licensing.js");
const pair = generateKeyPairSync("ed25519");
const publicKey = pair.publicKey.export({ type: "spki", format: "pem" });
const binding = "a".repeat(64);
const now = Date.now();
const base = {
  version: 1,
  application: "evergreen",
  licenceId: "test",
  owner: "Owner",
  installationId: binding,
  planes: ["tenant"],
  roles: ["ADMIN"],
  issuedAt: new Date(now - 1000).toISOString(),
  expiresAt: new Date(now + 100000).toISOString(),
  offlineUntil: new Date(now + 100000).toISOString(),
};
function envelope(claims = base, key = pair.privateKey) {
  const payload = Buffer.from(JSON.stringify(claims));
  return {
    payload: payload.toString("base64url"),
    signature: sign(null, payload, key).toString("base64url"),
  };
}
test("valid owner-signed licence authorizes only its installation and plane", () => {
  assert.equal(
    verifyInstallationLicence(envelope(), publicKey, "tenant", binding, now)
      .licenceId,
    "test",
  );
  assert.throws(() =>
    verifyInstallationLicence(envelope(), publicKey, "provider", binding, now),
  );
  assert.throws(() =>
    verifyInstallationLicence(
      envelope(),
      publicKey,
      "tenant",
      "b".repeat(64),
      now,
    ),
  );
});
test("modified payload, alternate signer, unsigned data and malformed documents fail closed", () => {
  const signed = envelope();
  signed.payload = Buffer.from(
    JSON.stringify({ ...base, planes: ["tenant", "provider"] }),
  ).toString("base64url");
  assert.throws(() =>
    verifyInstallationLicence(signed, publicKey, "provider", binding, now),
  );
  assert.throws(() =>
    verifyInstallationLicence(
      envelope(base, generateKeyPairSync("ed25519").privateKey),
      publicKey,
      "tenant",
      binding,
      now,
    ),
  );
  for (const value of [null, {}, { payload: "abc", signature: "" }, base])
    assert.throws(() =>
      verifyInstallationLicence(value, publicKey, "tenant", binding, now),
    );
});
test("expired, future and invalid validity windows fail closed", () => {
  for (const change of [
    { expiresAt: new Date(now).toISOString() },
    { issuedAt: new Date(now + 1000).toISOString() },
    { expiresAt: "invalid" },
    { issuedAt: base.expiresAt },
  ]) {
    assert.throws(() =>
      verifyInstallationLicence(
        envelope({ ...base, ...change }),
        publicKey,
        "tenant",
        binding,
        now,
      ),
    );
  }
});
test("licences for other applications and invalid scopes are rejected", () => {
  for (const change of [
    { application: "other" },
    { version: 2 },
    { planes: ["administrator"] },
    { planes: [] },
    { roles: ["OWNER"] },
    { roles: [] },
    { offlineUntil: new Date(now).toISOString() },
  ])
    assert.throws(() =>
      verifyInstallationLicence(
        envelope({ ...base, ...change }),
        publicKey,
        "tenant",
        binding,
        now,
      ),
    );
});
const device = generateKeyPairSync("rsa", { modulusLength: 3072 });
const grant = {
  claims: base,
  publicKey: device.publicKey.export({ type: "spki", format: "pem" }),
  offlineDays: 3,
};
function requestFor(licence = envelope(), time = now) {
  const unsigned = { licence, plane: "tenant", nonce: "a".repeat(43), time };
  return {
    ...unsigned,
    proof: sign("sha256", Buffer.from(JSON.stringify(unsigned)), {
      key: device.privateKey,
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    }).toString("base64url"),
  };
}
test("online renewal requires both the owner signature and device proof", () => {
  const request = requestFor();
  assert.equal(
    validateLeaseRequest(request, grant, now, publicKey).licenceId,
    "test",
  );
  assert.throws(() =>
    validateLeaseRequest(
      { ...request, proof: "invalid" },
      grant,
      now,
      publicKey,
    ),
  );
  assert.throws(() =>
    validateLeaseRequest(
      requestFor(envelope(), now - 400000),
      grant,
      now,
      publicKey,
    ),
  );
  assert.throws(() =>
    validateLeaseRequest(
      { ...request, plane: "provider" },
      grant,
      now,
      publicKey,
    ),
  );
});
test("online renewal recovers an offline timeout without extending the subscription", () => {
  const expiredOffline = {
    ...base,
    issuedAt: new Date(now - 100000).toISOString(),
    offlineUntil: new Date(now - 1000).toISOString(),
  };
  assert.equal(
    validateLeaseRequest(
      requestFor(envelope(expiredOffline)),
      grant,
      now,
      publicKey,
    ).expiresAt,
    base.expiresAt,
  );
  assert.throws(() =>
    validateLeaseRequest(
      requestFor(),
      {
        ...grant,
        claims: { ...base, expiresAt: new Date(now - 1).toISOString() },
      },
      now,
      publicKey,
    ),
  );
});
test("sealed licences decrypt only with the installation key and detect ciphertext tampering", () => {
  const encrypted = sealLease(base, grant.publicKey, pair.privateKey);
  const key = privateDecrypt(
    {
      key: device.privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encrypted.wrappedKey, "base64"),
  );
  const decrypt = (data) => {
    const cipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(encrypted.iv, "base64"),
    );
    cipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
    return Buffer.concat([cipher.update(data), cipher.final()]);
  };
  const plaintext = decrypt(Buffer.from(encrypted.data, "base64"));
  assert.equal(
    verifyInstallationLicence(
      JSON.parse(plaintext),
      publicKey,
      "tenant",
      binding,
      now,
    ).licenceId,
    "test",
  );
  const changed = Buffer.from(encrypted.data, "base64");
  changed[0] ^= 1;
  assert.throws(() => decrypt(changed));
  assert.throws(() => decodeEncryptedLicence(envelope()));
});
