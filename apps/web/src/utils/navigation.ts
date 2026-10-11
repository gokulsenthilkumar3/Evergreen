/** Consolidated modules keep old deep links useful without mounting duplicate ledgers. */
export function canonicalPage(page: string): string {
  const aliases: Record<string, string> = {
    yarnerp: 'workspace', customers: 'business', orders: 'business',
    invoicestudio: 'business', billing: 'business', insights: 'reports',
    bookellanam: 'bookellam', book_ellam: 'bookellam',
  };
  return Object.hasOwn(aliases, page) ? aliases[page] : page;
}
