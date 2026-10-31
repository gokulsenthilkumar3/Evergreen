import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const base =
  process.env.EVERGREEN_MARKETING_PREVIEW_URL || "http://localhost:3300";
const get = (route, init) =>
  fetch(base + route, { ...init, signal: AbortSignal.timeout(5000) });
for (const route of ["/demo/ThemeAuthored/", "/demo/ThemeAuthored/index.html", "/demo/ThemeAuthored/?review=authored"]) {
  const response = await get(route);
  const html = await response.text();
  assert.equal(response.status, 200, route);
  assert.match(
    html,
    /<title>EverGreen — Textile operating system \/ specification<\/title>/,
  );
  assert.ok(
    !html.includes("/@vite/client"),
    "The demo must not receive the React/Vite SPA entry",
  );
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(
    response.headers.get("content-security-policy") || "",
    /connect-src 'self'/,
  );
}
for (const [route, contentType] of [
  ["authored.css", "text/css"],
  ["authored.js", "javascript"],
  ["authored-model.js", "javascript"],
  ["mill-hall.js", "javascript"],
  ["OVERVIEW.md", "text/markdown"],
  ["docs/REFERENCE_REVIEW.md", "text/markdown"],
  ["assets/mark.svg", "image/svg+xml"],
  ["assets/evergreen-thread-study.jsx", "octet-stream"],
]) {
  const response = await get("/demo/" + route);
  assert.equal(response.status, 200, route);
  assert.ok(response.headers.get("content-type")?.includes(contentType), route);
}
assert.equal((await get("/demo/unknown.html")).status, 404);
assert.equal((await get("/demo/index.html", { method: "POST" })).status, 405);
assert.ok(
  [403, 404].includes((await get("/demo/%2e%2e%5cpackage.json")).status),
);
const original = await get("/");
assert.match(await original.text(), /EverGreen OS/);
new vm.Script(
  fs.readFileSync(
    new URL(
      "../public/demo/assets/evergreen-thread-study.jsx",
      import.meta.url,
    ),
    "utf8",
  ),
);
console.log(
  "Demo HTTP: ReAuthored entry, assets, CSP, method/path boundaries and preserved homepage verified. Adobe script syntax checked; Adobe execution not performed.",
);
