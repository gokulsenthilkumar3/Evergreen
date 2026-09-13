// @polsia:user-owned — brand identity. Edit freely. `site.ts` re-exports
// siteName/siteDescription; `manifest.ts` + `opengraph-image.tsx` read `brandVisual`.

export const siteName = 'Noolstitch';
export const siteDescription =
  "The complete operating system for Tiruppur's textile economy — mill ERP, trader billing, contract manufacturing marketplace, and B2B wholesale, all in one platform.";

// PWA + social-share colors. HEX only (the oklch() tokens in globals.css aren't
// readable here) — set to match your brand seed.
export const brandVisual = {
  /** PWA browser-UI / status-bar color. */
  themeColor: '#c07820',
  /** PWA splash + install background. */
  backgroundColor: '#ffffff',
  /** Social-share (OG/Twitter) image. */
  og: {
    background: '#1a1008',
    foreground: '#f5deb3',
    /** Second line under the site name; '' hides it. */
    tagline: "The complete operating system for Tiruppur's textile economy.",
  },
} as const;
