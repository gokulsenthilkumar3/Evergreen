/** Consolidated modules keep old deep links useful without mounting duplicate ledgers. */
export function canonicalPage(page: string): string {
  if (/^helpdesk\/(?:tickets\/[^/]+|queues|kb|sla|reporting)$/.test(page)) return 'helpdesk';
  const aliases: Record<string, string> = {
    yarnerp: 'workspace', customers: 'business', orders: 'business',
    invoicestudio: 'business', billing: 'business', insights: 'reports',
    bookellanam: 'bookellam', book_ellam: 'bookellam',
    // The activity log lives inside Settings; the Dashboard still links to it by its old name.
    logs: 'settings',
  };
  return Object.hasOwn(aliases, page) ? aliases[page] : page;
}

/** Position of the Audit Logs tab in Settings. */
export const SETTINGS_AUDIT_TAB = 4;

/** Which Settings tab a requested page should open on; `logs` means the audit log, not Company Info. */
export function settingsTabFor(page: string): number {
  return page === 'logs' ? SETTINGS_AUDIT_TAB : 0;
}
