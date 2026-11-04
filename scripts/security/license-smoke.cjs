// Run on the owner workstation. Reports outcomes only; never prints signing or access keys.
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { randomBytes, sign, constants } = require("node:crypto");
const licensing = require("../../packages/types/dist/licensing.js");
const {
  issueOnlineLease,
} = require("../../packages/types/dist/licensing-online.js");
const {
  OWNER_PUBLIC_KEY,
} = require("../../packages/types/dist/owner-public-key.js");
const cli = path.join(__dirname, "owner-license.cjs");
const keyDirectory = path.join(
  process.env.LOCALAPPDATA,
  "EverGreen/owner-keys",
);
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), "evergreen-licence-smoke-"),
);
const requestDirectory = path.join(temporary, "installation");
const output = path.join(temporary, "issued");
const run = (args) =>
  execFileSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
run(["request", "--license-dir", requestDirectory]);
const result = JSON.parse(
  run([
    "issue",
    "--key-dir",
    keyDirectory,
    "--request",
    path.join(requestDirectory, "installation-request.json"),
    "--license-dir",
    output,
    "--days",
    "1",
    "--offline-days",
    "1",
  ]),
);
process.env.EVERGREEN_INSTALLATION_KEY_FILE = path.join(
  requestDirectory,
  "installation-key.json",
);
process.env.EVERGREEN_OWNER_KEY_DIRECTORY = keyDirectory;
for (const plane of ["tenant", "provider"]) {
  process.env.EVERGREEN_LICENSE_FILE = path.join(output, `${plane}.json`);
  assert.equal(licensing.requireInstallationLicence(plane).planes[0], plane);
}
process.env.EVERGREEN_LICENSE_FILE = path.join(output, "tenant.json");
const licence = licensing.readLicenceEnvelope("tenant");
function request() {
  const unsigned = {
    licence,
    plane: "tenant",
    nonce: randomBytes(32).toString("base64url"),
    time: Date.now(),
  };
  const pem = licensing.readInstallationPrivateKey();
  try {
    return {
      ...unsigned,
      proof: sign("sha256", Buffer.from(JSON.stringify(unsigned)), {
        key: pem,
        padding: constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      }).toString("base64url"),
    };
  } finally {
    pem.fill(0);
  }
}
const signedRequest = request();
const renewed = issueOnlineLease(signedRequest);
const claims = licensing.verifyInstallationLicence(
  licensing.decodeEncryptedLicence(renewed),
  OWNER_PUBLIC_KEY,
  "tenant",
  licensing.installationId(),
);
assert.equal(claims.licenceId, result.licences[0].licenceId);
assert.throws(() => issueOnlineLease(signedRequest));
for (const issued of result.licences)
  run(["revoke", "--key-dir", keyDirectory, "--licence-id", issued.licenceId]);
assert.throws(() => issueOnlineLease(request()));
console.log(
  JSON.stringify(
    {
      encryptedActivation: "passed for both planes",
      deviceProofRenewal: "passed",
      replayRejection: "passed",
      revocation: "passed",
      productionActivations: "unchanged",
      temporaryEncryptedFixtures: temporary,
    },
    null,
    2,
  ),
);
