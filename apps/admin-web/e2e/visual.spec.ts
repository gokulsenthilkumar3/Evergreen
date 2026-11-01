import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-01T08:00:00Z"));
  await page.route("https://fonts.googleapis.com/**", (r) => r.abort());
  await page.route("https://fonts.gstatic.com/**", (r) => r.abort());
  await page.route("**/admin-api/**", async (route) => {
    const url = route.request().url();
    const body = url.includes("license/status")
      ? { active: true }
      : url.includes("auth/provider/session")
        ? { authenticated: true }
        : url.includes("/control/health")
          ? {
              host: "test-owner",
              dbPath: "/private/provider.db",
              dbFingerprint: "fixture-db",
              instance: "fixture-instance",
              latencyMs: 2,
              checkedAt: "2026-11-01T08:00:00Z",
            }
          : url.includes("/control/proof")
            ? { events: [], nextCursor: null }
            : url.endsWith("/companies")
              ? [
                  {
                    id: "visual-company",
                    name: "Visual fixture mill",
                    cloudProvider: "GCP",
                    status: "ACTIVE",
                    plan: "GROWTH",
                    tier: "TEST",
                    appVersion: "1.0.0",
                    activeStaff: 2,
                    maxUsers: 5,
                    maxMachines: 5,
                    docsPosted: 12,
                    maxDocsPerMonth: 100,
                    lastSyncAt: "2026-11-01T07:00:00Z",
                  },
                ]
              : url.endsWith("/control/records")
                ? [
                    {
                      id: "visual-record",
                      kind: "TASK",
                      title: "Visual fixture: inspect rollout evidence",
                      status: "OPEN",
                      owner: "Visual test",
                      priority: "NORMAL",
                      payload: {},
                      version: 1,
                      createdAt: "2026-11-01T07:00:00Z",
                      updatedAt: "2026-11-01T07:00:00Z",
                    },
                  ]
                : [];
    await route.fulfill({ json: body });
  });
});
for (const theme of ["dark", "light", "cinematic"])
  test("workspace " + theme, async ({ page }) => {
    await page.addInitScript(
      (mode) => localStorage.setItem("evergreen-owner-theme", mode),
      theme,
    );
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Command deck", exact: true }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot("deck-" + theme + ".png", {
      fullPage: true,
    });
  });
test("canvas scenes render with static reduced-motion portraits", async ({
  page,
}) => {
  for (const scene of ["companies", "rollouts", "storage", "proof", "events"]) {
    await page.goto("/__scenes/" + scene);
    await expect(page.locator(".scene-canvas")).toBeVisible();
    await expect(page.locator(".empty-scene")).toHaveAttribute(
      "data-canvas-ready",
      "true",
    );
    await expect(page).toHaveScreenshot("scene-" + scene + ".png", {
      fullPage: true,
    });
  }
});
test("proof only confirms with evidence and becomes stale on wall time", async ({
  page,
}) => {
  await page.goto("/__scenes/proof");
  await expect(page.locator(".proof-badge")).toHaveAttribute(
    "data-proof",
    "executed",
  );
  await page.getByRole("button", { name: "Supply test evidence" }).click();
  await expect(page.locator(".proof-badge")).toHaveAttribute(
    "data-proof",
    "verified",
  );
  await page.clock.setFixedTime(new Date("2026-11-01T08:02:00Z"));
  await expect(page.locator(".proof-badge")).toHaveAttribute(
    "data-proof",
    "stale",
  );
});
test("module navigation completes within the visual budget", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Command deck", exact: true }),
  ).toBeVisible();
  const start = Date.now();
  await page
    .getByRole("button", { name: "Proof & audit", exact: true })
    .click();
  await expect(page.locator(".proof-stage")).toBeVisible();
  expect(Date.now() - start).toBeLessThan(700);
});
