import { toast } from 'sonner';
import { formatApiError, ERROR_MESSAGES } from './messages';

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
      toast.error(data.message, {
        duration: 9000,
        action: {
          label: actionLabel,
          onClick: () => navigateToTab(targetPage, data.trace),
        },
      });
      return;
    }

    toast.error(data.message, { duration: 7000 });
    return;
  }

  toast.error(formatApiError(error, fallback));
}
