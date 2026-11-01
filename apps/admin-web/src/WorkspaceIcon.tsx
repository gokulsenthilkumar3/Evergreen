import type { TabId } from "./App";

const paths: Partial<Record<TabId, string>> = {
  MARKETING_SETTINGS: 'M3 4h18v16H3zM3 9h18M8 9v11m4-7h6m-6 3h4',
  DASHBOARD: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  TENANTS: "M3 21V8l6 3V8l6 3V3h5v18H3 M6 16h1m4 0h1m4 0h1",
  TASKS: "M9 5h11M9 12h11M9 19h11M3 5l1 1 2-3M3 12l1 1 2-3M3 19l1 1 2-3",
  DEPLOYMENTS: "M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6",
  PACKAGES: "m12 3 9 5-9 5-9-5 9-5 M3 8v9l9 5 9-5V8M12 13v9M7 5.5l9 5",
  MAINTENANCE:
    "M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 3-3-3 3-4Z",
  DATABASES:
    "M3 6c0-4 18-4 18 0s-18 4-18 0V18c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0",
  APIS: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
  WEBHOOKS:
    "M12 4v7m0 0-7 7m7-7 7 7M9 4a3 3 0 1 0 6 0 3 3 0 1 0-6 0M2 19a3 3 0 1 0 6 0 3 3 0 1 0-6 0M16 19a3 3 0 1 0 6 0 3 3 0 1 0-6 0",
  INTEGRATIONS:
    "m9 15 6-6m-5-4 2-2a5 5 0 0 1 7 7l-2 2m-3 7-2 2a5 5 0 0 1-7-7l2-2",
  PAYMENTS: "M3 5h18v14H3z M3 10h18 M7 15h3",
  AGREEMENTS: "M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8M8 16h6",
  AI_AGENT: "M12 3v3M5 7h14v13H5zM2 11v5m20-5v5M9 12h.01M15 12h.01M9 16h6",
  CHAT: "M3 4h18v13H8l-5 4V4 M7 9h10M7 13h6",
  SCRIPTS: "M3 4h18v16H3z m4 5 4 3-4 3m6 1h4",
  LOGS: "M5 3h14v18H5z M8 7h8M8 12h8M8 17h5",
};

export function WorkspaceIcon({ name }: { name: TabId }) {
  return (
    <svg
      className="nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || 'M12 3 21 8v9l-9 5-9-5V8l9-5 M12 3v19M3 8l9 5 9-5'} />
    </svg>
  );
}
