const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  unprotectOwnerData,
  ownerHostEnvironment,
} = require("../../packages/types/dist/licensing.js");
let stage = "load protected owner credential";
async function main() {
  const directory = path.join(process.env.LOCALAPPDATA, "EverGreen/owner-keys");
  const key = unprotectOwnerData(
    fs
      .readFileSync(path.join(directory, "provider-access-key.dpapi"))
      .toString("base64"),
  ).toString("utf8");
  const get = (base, route, init) =>
    fetch(base + route, { ...init, signal: AbortSignal.timeout(10000) });
  for (const port of [4300, 4301]) {
    stage = `licence status ${port}`;
    const response = await get(`http://127.0.0.1:${port}`, "/license/status");
    assert.equal((await response.json()).active, true);
  }
  assert.equal((await get("http://127.0.0.1:4301", "/users")).status, 401);
  assert.equal((await get("http://127.0.0.1:4300", "/companies")).status, 401);
  assert.equal(
    (
      await get("http://127.0.0.1:4300", "/status", {
        headers: { Authorization: `Bearer ${key}` },
      })
    ).status,
    200,
  );
  const provider = "http://127.0.0.1:4300";
  stage = 'verify live database diagnostics and assistant isolation';
  const diagnostics = await get(provider, '/control/database', { headers: { Authorization: `Bearer ${key}` } });
  assert.equal(diagnostics.status, 200);
  const database = await diagnostics.json();
  assert.equal(database.integrity, 'ok');
  assert.equal(database.tenantDatabaseAccess, false);
  assert.ok(database.models.some(model => model.name === 'Company'));
  assert.ok(!JSON.stringify(database).includes(key));
  assert.equal((await get(provider, '/ai/owner')).status, 401);
  const assistant = await get(provider, '/ai/owner', { headers: { Authorization: `Bearer ${key}` } });
  assert.equal(assistant.status, 200);
  assert.equal((await assistant.json()).name, 'EverGreen Atlas');
  const tenantSpec = await (await get('http://127.0.0.1:4301', '/api/docs-json')).json();
  assert.deepEqual(tenantSpec.paths['/ai/marketing'].post.security, []);
  assert.deepEqual(tenantSpec.paths['/ai/staff'].post.security, [{ bearer: [] }]);
  assert.ok(tenantSpec.paths['/helpdesk/tickets'].post.requestBody);
  const providerSpec = await (await get(provider, '/api/docs-json')).json();
  assert.ok(providerSpec.components.securitySchemes['provider-session']);
  stage = "create provider session";
  const session = await get(provider, "/auth/provider/session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      Origin: "http://localhost:5174",
    },
  });
  assert.equal(session.status, 201);
  stage = "verify provider session cookie flags";
  const setCookie = session.headers.get("set-cookie");
  assert.ok(
    setCookie &&
      /HttpOnly/i.test(setCookie) &&
      /SameSite=Strict/i.test(setCookie),
  );
  assert.ok(!setCookie.includes(key));
  const cookie = setCookie.split(";")[0];
  stage = "authenticate provider session";
  assert.equal(
    (await get(provider, "/companies", { headers: { Cookie: cookie } })).status,
    200,
  );
  stage = "reject untrusted session origin";
  assert.equal(
    (
      await get(provider, "/auth/provider/session", {
        method: "DELETE",
        headers: { Cookie: cookie, Origin: "https://untrusted.invalid" },
      })
    ).status,
    401,
  );
  stage = "revoke provider session";
  assert.equal(
    (
      await get(provider, "/auth/provider/session", {
        method: "DELETE",
        headers: { Cookie: cookie, Origin: "http://localhost:5174" },
      })
    ).status,
    200,
  );
  stage = "reject revoked provider session";
  assert.equal(
    (await get(provider, "/companies", { headers: { Cookie: cookie } })).status,
    401,
  );
  stage = "reject unsigned lease and verify private database paths";
  assert.equal(
    (
      await get("http://127.0.0.1:4300", "/licensing/lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
    ).status,
    403,
  );
  for (const plane of ["tenant", "provider"]) {
    const environment = ownerHostEnvironment(plane);
    const url =
      plane === "tenant"
        ? environment.DATABASE_URL
        : environment.ADMIN_DATABASE_URL;
    assert.ok(
      url.startsWith("file:") &&
        !url.toLowerCase().includes("projects/evergreen"),
    );
  }
  console.log(
    JSON.stringify(
      {
        localLicences: "verified",
        tenantAnonymousAccess: "rejected",
        providerAnonymousAccess: "rejected",
        ownerProviderCredential: "accepted",
        providerSession: "HttpOnly, origin checked, logout revoked",
        databaseDiagnostics: 'Live integrity and schema verified',
        apiReferences: 'Assistant/ticket schemas and authentication verified',
        unsignedOnlineRenewal: "rejected",
        databases: "private owner-host storage",
        keyMaterial: "not displayed",
      },
      null,
      2,
    ),
  );
}
main().catch(() => {
  console.error(
    `Owner-host security verification failed at: ${stage}. No key material was displayed.`,
  );
  process.exitCode = 1;
});
