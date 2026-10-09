import { toast } from 'sonner';
import { formatApiError, ERROR_MESSAGES } from './messages';
import { formatProductionTime } from './productionTiming';

export interface DeleteGuardTrace {
  inwardId?: number | string;
  batchNo?: string;
  productionId?: number | string;
  productionIds?: Array<number | string>;
  bagCodes?: string[];
  counts?: string[];
  wasteId?: number | string;
  wasteTypes?: string[];
  outwardId?: number | string;
  invoiceNo?: string;
  [key: string]: any;
}

export interface DeleteGuardErrorPayload {
  statusCode?: number;
  code?: string;
  message?: string;
  trace?: DeleteGuardTrace;
  redirectTo?: string;
  blockingProductionIds?: number[];
  blockingOutwardIds?: number[];
  inwardReceivedAt?: string;
  earliestStartAt?: string;
}

/**
 * Dispatch navigation event to switch tab/page across the application
 */
export function navigateToTab(page: string, params?: Record<string, any>) {
  window.dispatchEvent(
    new CustomEvent('evergreen:navigate', {
      detail: { page, params },
    }),
  );
}

/**
 * Handles Delete-Guard & Business Validation Errors with actionable Toast and navigation
 */
export function handleDeleteGuardError(
  error: any,
  fallback = ERROR_MESSAGES.DELETE_FAILED,
) {
  const data: DeleteGuardErrorPayload = error?.response?.data;

  if (data?.code && data?.message) {
    const titles: Record<string, string> = {
      INWARD_UNDER_PRODUCTION: 'This batch is still used in production',
      PRODUCTION_TOO_EARLY: 'Choose a later production start',
      PRODUCTION_IN_FUTURE: 'Production cannot start in the future',
      MASS_BALANCE_EXCEEDED: 'Check the production quantities',
      PRODUCTION_HAS_BILLED_BAGS: 'This production has dispatched or billed yarn',
      PRODUCTION_HAS_SOLD_WASTE: 'This production has sold waste',
    };
    const title = titles[data.code] || 'This action could not be completed';
    const earliest = formatProductionTime(data.earliestStartAt);
    const description = data.code === 'PRODUCTION_TOO_EARLY' && earliest
      ? `Batch ${data.trace?.batchNo || 'selected'} is ready from ${earliest}. Update the production start time and try again.`
      : data.message;
    const notify = data.code === 'PRODUCTION_TOO_EARLY' || data.code === 'PRODUCTION_IN_FUTURE' ? toast.warning : toast.error;
    const rawRedirect = data.redirectTo || '';
    let targetPage = '';
    let actionLabel = '';

    if (rawRedirect.startsWith('/production')) {
      targetPage = 'production';
      actionLabel = 'View Production';
    } else if (rawRedirect.startsWith('/outward')) {
      targetPage = 'outward';
      actionLabel = 'View Outward';
    } else if (rawRedirect.startsWith('/inward')) {
      targetPage = 'inward';
      actionLabel = 'View Inward';
    } else if (
      rawRedirect.startsWith('/inventory') ||
      rawRedirect.startsWith('/waste')
    ) {
      targetPage = 'inventory';
      actionLabel = 'View Inventory';
    } else if (
      rawRedirect.startsWith('/business') ||
      rawRedirect.startsWith('/invoices')
    ) {
      targetPage = 'commerce-desk';
      actionLabel = 'View Invoices';
    }

    if (targetPage && actionLabel) {
      notify(title, {
        description,
        duration: 9000,
        action: {
          label: actionLabel,
          onClick: () => navigateToTab(targetPage, data.trace),
        },
      });
      return;
    }

    notify(title, { description, duration: 7000 });
    return;
  }

  toast.error(formatApiError(error, fallback));
}
