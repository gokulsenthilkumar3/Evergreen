// @polsia:user-owned — app navigation rendered by SiteNav/SiteFooter and read by
// the sitemap. Edit it as pages are added or removed.
// This list is a convenience, not module registration.

export type NavGroup = 'primary' | 'secondary' | 'footer';

export interface NavItem {
  /** Visible link text. */
  label: string;
  /** App route, e.g. '/' or '/dashboard'. */
  href: string;
  /** Where it renders: top-nav 'primary'/'secondary', or 'footer'. */
  group: NavGroup;
  /** Group `primary` items into a dropdown: items sharing a `menu` value collapse
   *  into one "<menu> ⌄" top-bar slot (e.g. `menu: 'Resources'` on Blog/Docs/
   *  Changelog). Keeps the bar short. Ignored for 'secondary'/'footer'. */
  menu?: string;
  /** When true, render only if a session exists (see site-nav.tsx). */
  requiresAuth?: boolean;
  /** Sort key within a group (ascending); unordered items fall to the end. */
  order?: number;
}

// Keep the bar short: ~3-5 primary slots, group the tail with `menu`, push the
// rest to 'footer' (SiteNav overflows extras into a "More" dropdown). Example:
//   { label: 'Pricing', href: '/pricing', group: 'primary' },
//   { label: 'Blog',    href: '/blog',    group: 'primary', menu: 'Resources' },
//   { label: 'Docs',    href: '/docs',    group: 'primary', menu: 'Resources' },
//   { label: 'Sign in', href: '/login',   group: 'secondary' },
export const navItems: NavItem[] = [
  { label: 'Platform', href: '/#platform', group: 'primary', order: 1 },
  { label: 'Marketplace', href: '/#marketplace', group: 'primary', order: 2 },
  { label: 'Vyapari', href: '/vyapari/invoice', group: 'primary', order: 3 },
  { label: 'Inventory', href: '/inventory', group: 'primary', order: 4 },
  { label: 'Receive Stock', href: '/inward-entry', group: 'primary', order: 5 },
  { label: 'Costing', href: '/costing/history', group: 'primary', order: 6 },
  { label: 'Production', href: '/production/history', group: 'primary', order: 7 },
  { label: 'Pricing', href: '/#pricing', group: 'primary', order: 8 },
  { label: 'Join Waitlist', href: '/#waitlist', group: 'secondary', order: 0 },
  { label: 'Contact', href: 'mailto:noolstitch@polsia.app', group: 'footer', order: 0 },
  { label: 'Sample invoice', href: '/vyapari/invoice/sample', group: 'footer', order: 1 },
];
