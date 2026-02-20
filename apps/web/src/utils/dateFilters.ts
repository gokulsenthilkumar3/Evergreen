/**
 * Standardized Date Filter Utility
 *
 * Date filter options:
 * - today: Current day
 * - week: This week (starting Sunday)
 * - month: This month (starting from 1st)
 * - year: This year (starting from January 1st)
 * - custom: User-defined range
 */

export type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

export interface DateRange {
    from: string;
    to: string;
}

/**
 * Get the date range for a given filter type.
 * - today: just today
 * - week: Sunday of this week to today
 * - month: 1st of this month to today
 * - year: January 1st of this year to today
 * - custom: user-provided dates
 * - all: empty strings (no filter)
 */
export function getDateRange(
    filterType: DateFilterType,
    customFrom?: string,
    customTo?: string
): DateRange {
    const today = new Date();
    const toStr = today.toLocaleDateString('en-CA'); // Gets YYYY-MM-DD in local time

    switch (filterType) {
        case 'today':
            return { from: toStr, to: toStr };

        case 'week': {
            // This week starting Sunday
            const sunday = new Date(today);
            sunday.setDate(today.getDate() - today.getDay()); // getDay() returns 0 for Sunday
            return { from: sunday.toISOString().split('T')[0], to: toStr };
        }

        case 'month': {
            // This month starting from the 1st
            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { from: firstOfMonth.toISOString().split('T')[0], to: toStr };
        }

        case 'year': {
            // This year starting from January 1st
            const firstOfYear = new Date(today.getFullYear(), 0, 1);
            return { from: firstOfYear.toISOString().split('T')[0], to: toStr };
        }

        case 'custom': {
            if (customFrom && customTo) {
                return { from: customFrom, to: customTo };
            }
            return { from: '', to: '' };
        }

        case 'all':
        default:
            return { from: '', to: '' };
    }
}

/**
 * Standard date filter menu items for consistent UI across the app.
 */
export const DATE_FILTER_OPTIONS: { value: DateFilterType; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
];

/**
 * Date filter options including "All Time" option (for history pages).
 */
export const DATE_FILTER_OPTIONS_WITH_ALL: { value: DateFilterType; label: string }[] = [
    { value: 'all', label: 'All Time' },
    ...DATE_FILTER_OPTIONS,
];
