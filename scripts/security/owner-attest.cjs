// Output is public signed approval; the owner private key never leaves this process.
const fs = require("node:fs");
const path = require("node:path");
const { createPrivateKey, sign, randomUUID } = require("node:crypto");
const { unprotectOwnerData } = require("../../packages/types/dist/licensing");
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce(
      (pairs, value, index, all) =>
        index % 2 ? pairs : [...pairs, [value, all[index + 1]]],
      [],
    ),
);
const id = args["--id"],
  entityDigest = args["--digest"];
if (!id || !entityDigest || !/^[a-f0-9]{64}$/i.test(entityDigest))
  throw Error(
    "Usage: node scripts/security/owner-attest.cjs --id RECORD_ID --digest SHA256",
  );
const keyFile = path.join(
  process.env.LOCALAPPDATA,
  "EverGreen/owner-keys/owner-signing-key.dpapi",
);
const encoded = unprotectOwnerData(fs.readFileSync(keyFile).toString("base64"));
try {
  const key = createPrivateKey(encoded);
  const issuedAt = Date.now();
  const payload = {
    entityId: id,
    entityDigest,
    scope: "OPERATOR_APPROVAL",
    issuedAt,
    expiresAt: issuedAt + 120000,
    nonce: randomUUID(),
  };
  const text =
    "{" +
    Object.keys(payload)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + JSON.stringify(payload[k]))
      .join(",") +
    "}";
  console.log(
    JSON.stringify({
      payload,
      signature: sign(null, Buffer.from(text), key).toString("base64url"),
    }),
  );
} finally {
  encoded.fill(0);
}
