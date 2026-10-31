The gallery is URL-only: the main marketing homepage does not link here. Thread Story was moved from the homepage into this collection.

# Marketing theme collection

Start at http://localhost:3300/demo/ to choose a theme. Canonical routes use lowercase /demo/ consistently.

| Theme | Route | Source |
| --- | --- | --- |
| Genesis Atelier | [ThemeGenesisAtelier](ThemeGenesisAtelier/) | New procedural yarn and weave experience; no API connections |
| Thread Story | [ThemeThreadStory](ThemeThreadStory/) | Reference synthesis, local-only Scout preview |
| Authored Studio | [ThemeAuthored](ThemeAuthored/) | Current interactive specification demo |
| Command Cinema | [ThemeCommand](ThemeCommand/) | Command-center-inspired cinematic demo |
| Original Studio | [ThemeOriginal](ThemeOriginal/) | Evergreen Demo Marketing.html |
| Fiber & Flow | [ThemeFiber](ThemeFiber/) | Evergreen Demo Marketing 1.html |
| Operating Platform | [ThemePlatform](ThemePlatform/) | evergreen_textile_operating_platform.html (Intelligent Platform) |
| Real-Time Profit | [ThemeRealTimeProfit](ThemeRealTimeProfit/) | evergreen_textile_operating_platform.html (Raw Fiber to Real-Time Profit) |
| Textile Mills | [ThemeTextile](ThemeTextile/) | EverGreen for Textile Mills.html |

Original source HTML files are preserved under `apps/marketing-web/Demo/` in their dedicated folders (`ThemeFiber`, `ThemeOriginal`, `ThemePlatform`, `ThemeRealTimeProfit`, `ThemeTextile`, `ThemeGenesisAtelier`, and `ThemeThreadStory`) with their supplied filenames. Preview copies include a gallery return link. Reference themes retain their original styling and scripts under a scoped preview CSP. Shared authored assets remain at /demo/ so existing asset URLs remain valid.

# EverGreen ? ReAuthored specification demo

Preview: http://localhost:3300/demo/ThemeAuthored/

The demo applies the supplied ReAuthored text as a paper specification with six chapters: cover, record, spec, arithmetic, limits and brief. The original marketing homepage remains at /. The supplied reference files are preserved.

## Review the experience

The cover introduces a technical yarn-package drawing. The record chapter explains carding, six operational handoffs and three selectable missing-record cases. Owner, accountant and floor consequences appear together. Desktop native scroll advances a seven-record ticket sequence; mobile and reduced-motion readers use step buttons. No wheel interception is used. The optional 60-bobbin WebGL study loads only on request, with an original SVG fallback and keyboard position selector.

The specification distinguishes implemented features from unverified integrations. The arithmetic shows its assumptions and calculations as text. The limits chapter covers connectivity, licensing, exit, accountancy, regulatory changes and backup responsibilities. The brief is a local copy/download draft; it is never submitted to a server.

## Contact Us ? editable by the owner

| Team      | Initial public address  |
| --------- | ----------------------- |
| Sales     | sales@evergreen.com     |
| Marketing | marketing@evergreen.com |
| Licensing | licensing@evergreen.com |
| Support   | support@evergreen.com   |

Hours: **09:00?18:00 IST (Asia/Kolkata)**. Working days and response-time commitments are unspecified.

Open the provider admin portal at http://localhost:5174/, authenticate with your existing owner credential, then select **Marketing settings**. Edit the four addresses and opening/closing times and choose **Publish contact details**. Refresh the demo to see the publication. This does not provision mailboxes or configure email delivery. The setting editor currently controls this specification demo; other portal contact blocks are not automatically rewritten.

Only public contact fields and the version are exposed by GET /public/marketing-settings. Writes use authenticated POST /control/marketing-settings, with validation, optimistic concurrency and a transaction audit event. Settings are stored in the provider database, not browser storage. No schema migration is needed. A timeout or unavailable provider retains the confirmed defaults in the demo.

Deployment uses the exact /marketing-api/site-settings route. Docker's marketing profile needs the provider profile running for saved values; otherwise the fallback remains. Marketing joins the provider network for this fixed public projection; provider API authentication remains mandatory for private routes. No generic provider proxy is added.

See [acceptance](docs/ACCEPTANCE.md), [design system](docs/DESIGN_SYSTEM.md), [motion handoff](docs/MOTION_HANDOFF.md) and [source mapping](docs/REAUTHORED_APPLIED.md).

## Colour and dimensional studies

The latest demo adds Forest & copper, Indigo & saffron, and Clay & rose palettes. The cover includes a shaded yarn drawing and an opt-in procedural WebGL yarn model with pointer interaction. A CSS 3D weaving field, travelling fibre strokes and coloured process panels accompany the existing 60-bobbin hall. Motion pause, reduced motion, text view and print fallbacks remain supported. These are original browser-rendered studies, not Adobe renders or live machinery.

## Command Cinema theme

Open [Command Cinema](ThemeCommand/). This separate marketing concept draws from the tenant CommandCenter.tsx and WarRoomView.tsx navy/emerald/cyan palette, campus geometry and operational panels. A 24-second browser-native presentation includes play/pause, timeline scrubbing, three chapters and fullscreen. Reduced-motion readers can select chapters manually. It pauses offscreen or when the tab is hidden. Geometry and record labels are illustrative; no tenant API or private records are loaded. This is an interactive animation, not an encoded video file. Sales contact and hours use the existing public settings projection.
