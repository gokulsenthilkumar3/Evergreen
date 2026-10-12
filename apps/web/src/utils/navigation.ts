/** Consolidated modules keep old deep links useful without mounting duplicate ledgers. */
export function canonicalPage(page: string): string {
  const aliases: Record<string, string> = {
    yarnerp: 'workspace', customers: 'business', orders: 'business',
    invoicestudio: 'business', billing: 'business', insights: 'reports',
    bookellanam: 'bookellam', book_ellam: 'bookellam',
    // The activity log lives inside Settings; the Dashboard still links to it by its old name.
    logs: 'settings',
  };
  return Object.hasOwn(aliases, page) ? aliases[page] : page;
}
