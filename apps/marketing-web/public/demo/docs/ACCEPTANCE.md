# ReAuthored acceptance

Run npm run test:demo -w apps/marketing-web for the current ReAuthored suite. It verifies public defaults and sanitization, bounded arithmetic, six chapters, local resources, valid anchors, 60 static bobbins, actual DOM keyboard tabs, all three fault cases, XML dialog, manual story steps, safe local drafts, contact loading and WebGL failure fallback. Old demo.test.mjs is retained as a historical suite and is no longer the test:demo target.

Run npm run test:demo:http -w apps/marketing-web with port 3300 active. It checks the actual standalone entry, headers, static asset MIME, missing assets, method and path boundaries and the preserved homepage. Adobe script syntax is checked; Adobe execution is not.

Run npm run build -w apps/marketing-web and npm run build -w apps/admin-web. The provider API has service tests in marketing-settings.controller.spec.ts; the owner editor tests cover publication and conflict/failure behavior. The owner-only scripts/security/marketing-settings-smoke.cjs verifies live public whitelisting, persistence, unauthorized writes and stale versions; it republishes current values without changing them and adds an audit event.

Manual approval remains necessary for desktop/mobile visual inspection, actual canvas picking, low-end GPU measurements, keyboard/screen-reader behavior in a real browser and A4 output. The browser automation surface was unavailable in this session. DOM and HTTP checks are not screenshots, Lighthouse measurements or external Tally import verification.

Saved contacts are fetched by one same-origin GET with credentials omitted. Brief inputs remain local, with no analytics, AI requests or form POST. The exact public contact projection accepts reads; all settings writes remain on the authenticated provider route. These settings do not create mailboxes.
