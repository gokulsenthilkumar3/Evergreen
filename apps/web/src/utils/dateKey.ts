/** Stable local calendar date for inputs, API parameters and record matching.
 * Display formatting must never be used as a storage or comparison key.
 */
export function dateKey(value: Date | string = new Date()): string {
  // Date-only API values already identify a calendar day, without a timezone.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
