/**
 * EverGreen — Standardized Message Constants
 * Centralized message dictionary for consistent UX across all modules
 */

// ─── Success Messages ─────────────────────────────────────────────────────────

export const SUCCESS_MESSAGES = {
  // CRUD Operations
  CREATE: '✓ Created successfully',
  UPDATE: '✓ Updated successfully',
  DELETE: '✓ Deleted successfully',
  SAVE: '✓ Saved successfully',
  SUBMIT: '✓ Submitted successfully',
  CANCEL: '✓ Cancelled successfully',

  // Export Operations
  EXPORT_EXCEL: '✓ Exported to Excel successfully',
  EXPORT_PDF: '✓ Exported to PDF successfully',
  EXPORT_CSV: '✓ Exported to CSV successfully',
  EMAIL_SENT: '✓ Email sent successfully',
  PRINT: '✓ Document sent to printer',

  // Auth Operations
  LOGIN: '✓ Welcome back!',
  LOGOUT: '✓ Logged out successfully',
  PASSWORD_CHANGE: '✓ Password changed successfully',
  USER_CREATE: '✓ User created successfully',
  USER_UPDATE: '✓ User updated successfully',
  USER_DELETE: '✓ User deleted successfully',

  // Data Operations
  IMPORT: '✓ Data imported successfully',
  SYNC: '✓ Data synchronized successfully',
  BACKUP: '✓ Backup created successfully',
  RESTORE: '✓ Data restored successfully',

  // Workflow
  PRODUCTION_SAVED: '✓ Production entry saved successfully',
  INWARD_SAVED: '✓ Inward batch saved successfully',
  OUTWARD_SAVED: '✓ Outward dispatch saved successfully',
  WASTE_PROCESSED: '✓ Waste processed successfully',
  INVOICE_CREATED: '✓ Invoice created successfully',
  INVOICE_DELETED: '✓ Invoice deleted successfully',
  PAYMENT_RECORDED: '✓ Payment recorded successfully',
  COSTING_SAVED: '✓ Cost entry saved successfully',

  // Settings
  SETTINGS_SAVED: '✓ Settings saved successfully',
  COMPANY_INFO_UPDATED: '✓ Company information updated',
  RATES_UPDATED: '✓ Rates updated successfully',
};

// ─── Error Messages ──────────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  // Generic Errors
  GENERIC: '✗ Something went wrong. Please try again.',
  NETWORK: '✗ Network error. Please check your connection.',
  TIMEOUT: '✗ Request timed out. Please try again.',
  SERVER_ERROR: '✗ Server error. Please contact support.',
  NOT_FOUND: '✗ Resource not found',
  UNAUTHORIZED: '✗ You are not authorized to perform this action',
  FORBIDDEN: '✗ Access denied',
  VALIDATION_FAILED: '✗ Please fix the errors above',

  // CRUD Errors
  CREATE_FAILED: '✗ Failed to create',
  UPDATE_FAILED: '✗ Failed to update',
  DELETE_FAILED: '✗ Failed to delete',
  SAVE_FAILED: '✗ Failed to save',
  FETCH_FAILED: '✗ Failed to fetch data',

  // Data Validation
  REQUIRED_FIELD: (field: string) => `✗ ${field} is required`,
  INVALID_FORMAT: (field: string) => `✗ ${field} format is invalid`,
  INVALID_DATE: '✗ Invalid date selected',
  FUTURE_DATE: '✗ Date cannot be in the future',
  PAST_DATE: '✗ Date cannot be in the past',
  DUPLICATE_ENTRY: '✗ This entry already exists',
  DUPLICATE_INVOICE: '✗ Invoice number already exists',

  // Numeric Validation
  INVALID_NUMBER: '✗ Please enter a valid number',
  NEGATIVE_NUMBER: '✗ Value cannot be negative',
  ZERO_NOT_ALLOWED: '✗ Value must be greater than zero',
  MAX_EXCEEDED: (max: number) => `✗ Value cannot exceed ${max}`,
  MIN_REQUIRED: (min: number) => `✗ Value must be at least ${min}`,

  // Business Logic
  NO_DATA: '✗ No data available',
  INVALID_INPUT: '✗ Please provide valid input',
  INVALID_QUANTITY: '✗ Invalid quantity',
  LOW_STOCK_THRESHOLD: '✗ Low stock threshold must be greater than 0 when alerts are enabled',
  EXCEEDS_AVAILABLE_BALES: '✗ Total bales exceeds available bales',
  EXCEEDS_AVAILABLE_WEIGHT: '✗ Total weight exceeds available weight',
  INSUFFICIENT_STOCK: '✗ Insufficient stock available',
  BATCH_NOT_FOUND: '✗ Batch not found',
  INVALID_BATCH_DATE: '✗ Batch date is after production date',
  MATERIAL_BALANCE_MISMATCH: '✗ Material balance mismatch: Input must equal Yarn + Waste + Intermediate',
  INVOICE_PAID_DELETE: '✗ Cannot delete paid invoices. Delete payments first.',
  COSTING_DEPENDENCY: '✗ Please delete dependent costing entries first',
  OUTWARD_DEPENDENCY: '✗ Please delete dependent outward entries first',

  // Auth Errors
  INVALID_CREDENTIALS: '✗ Invalid username or password',
  SESSION_EXPIRED: '✗ Session expired. Please login again.',
  ACCOUNT_LOCKED: '✗ Account locked. Please contact admin.',
  USER_EXISTS: '✗ Username already exists',
  WEAK_PASSWORD: '✗ Password must be at least 6 characters',

  // Export/Email
  EXPORT_FAILED: '✗ Export failed. Please try again.',
  EMAIL_FAILED: '✗ Failed to send email',
  PRINT_FAILED: '✗ Print failed',

  // File Operations
  FILE_TOO_LARGE: (max: string) => `✗ File size exceeds ${max} limit`,
  FILE_TOO_LARGE_GENERIC: '✗ File size exceeds limit',
  INVALID_FILE_TYPE: '✗ Invalid file type',
  UPLOAD_FAILED: '✗ File upload failed',
};

// ─── Warning Messages ────────────────────────────────────────────────────────

export const WARNING_MESSAGES = {
  // Confirmation
  UNSAVED_CHANGES: '⚠ You have unsaved changes. Are you sure you want to leave?',
  DELETE_CONFIRM: '⚠ This action cannot be undone.',
  BULK_DELETE: (count: number) => `⚠ You are about to delete ${count} items.`,

  // Data Quality
  LOW_STOCK: (item: string, qty: number) => `⚠ Low stock alert: ${item} (${qty} remaining)`,
  LOW_EFFICIENCY: (eff: number) => `⚠ Low efficiency: ${eff}%. Normal range: 80-95%`,
  HIGH_WASTE: (waste: number) => `⚠ High waste percentage: ${waste}%`,
  AVG_BALE_WEIGHT_LOW: (avg: number) => `⚠ Avg bale weight is very low (${avg.toFixed(1)} kg/bale)`,
  AVG_BALE_WEIGHT_HIGH: (avg: number) => `⚠ Avg bale weight is very high (${avg.toFixed(1)} kg/bale)`,

  // Business Logic
  FUTURE_DATE_SELECTED: '⚠ You selected a future date',
  PARTIAL_PAYMENT: '⚠ Partial payment recorded. Balance remains.',
  INVOICE_OVERDUE: '⚠ Invoice is overdue',
  DUPLICATE_COUNTS: '⚠ Duplicate yarn counts. Please combine rows with the same count.',
  INSUFFICIENT_STOCK_DETAIL: (item: string, bags: number, kg: number) => `⚠ Insufficient stock for ${item}. Available: ${bags} bags (${kg.toFixed(2)} kg)`,

  // Info
  NO_DATA_RANGE: '⚠ No data found for selected date range',
  PRODUCTION_REQUIRED: '⚠ No production records found for selected date',
};

// ─── Info Messages ───────────────────────────────────────────────────────────

export const INFO_MESSAGES = {
  // Loading
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  PROCESSING: 'Processing...',
  FETCHING: 'Fetching data...',

  // Empty States
  NO_DATA: 'No data available',
  NO_RESULTS: 'No results found',
  NO_HISTORY: 'No history records',
  NO_INVOICES: 'No invoices found',
  NO_PAYMENTS: 'No payment records',

  // Help Text
  TIP_SAVE_SHORTCUT: 'Tip: Press Ctrl+S to save',
  TIP_SEARCH_SHORTCUT: 'Tip: Press Ctrl+K to search',
  TIP_FILTER: 'Use filters to narrow results',
  TIP_EXPORT: 'Export data for offline analysis',

  // Status
  CHANGES_SAVED: 'Changes saved',
  AUTO_SAVED: 'Auto-saved',
  SESSION_ACTIVE: 'Session active',
  LAST_UPDATED: (date: string) => `Last updated: ${date}`,

  // Business Info
  PAST_DATE_STOCK_INFO: (date: string) => `ℹ Adding outward for ${date} — only stock produced on or before that date counts.`,
  EDIT_WORKFLOW_DELETE_CREATE: 'ℹ Editing will delete the old entry and create a new one',
  OPENING_EMAIL: 'ℹ Opening email client...',
};

// ─── Confirmation Dialog Titles ────────────────────────────────────────────────

export const CONFIRM_TITLES = {
  DELETE: 'Confirm Delete',
  DELETE_USER: 'Delete User',
  DELETE_INVOICE: 'Delete Invoice',
  DELETE_PRODUCTION: 'Delete Production Entry',
  DELETE_PAYMENT: 'Delete Payment',
  BULK_DELETE: 'Confirm Bulk Delete',
  SAVE_CHANGES: 'Save Changes?',
  DISCARD_CHANGES: 'Discard Changes?',
  LOGOUT: 'Confirm Logout',
  CANCEL_OPERATION: 'Cancel Operation',
  UPDATE_SETTINGS: 'Update Settings',
};

// ─── Confirmation Messages ────────────────────────────────────────────────────

export const CONFIRM_MESSAGES = {
  DELETE: 'Are you sure you want to delete this item? This action cannot be undone.',
  DELETE_USER: (username: string) => `Are you sure you want to delete user "${username}"?`,
  DELETE_INVOICE: (invNo: string) => `Delete invoice ${invNo}? Associated payments will also be deleted.`,
  DELETE_PRODUCTION: 'Deleting production will revert inventory changes. Continue?',
  DELETE_PAYMENT: 'Delete this payment? The invoice status will be updated.',
  BULK_DELETE: (count: number) => `You are about to permanently delete ${count} items. This cannot be undone.`,
  UNSAVED_CHANGES: 'You have unsaved changes. Save before leaving?',
  DISCARD_CHANGES: 'Discard all changes and return?',
  LOGOUT: 'Are you sure you want to log out?',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Format error message with API response
 */
export const formatApiError = (error: any, fallback = ERROR_MESSAGES.GENERIC): string => {
  if (!error) return fallback;

  // Handle API error response
  if (error.response?.data?.message) {
    return `✗ ${error.response.data.message}`;
  }

  // Handle array of errors
  if (Array.isArray(error.response?.data)) {
    return error.response.data.map((e: any) => `✗ ${e.message || e}`).join(', ');
  }

  // Handle network errors
  if (error.message?.includes('Network Error')) {
    return ERROR_MESSAGES.NETWORK;
  }

  // Handle timeout
  if (error.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  return fallback;
};

/**
 * Format success message with entity name
 */
export const formatSuccessMessage = (
  baseMessage: string,
  entityName?: string
): string => {
  if (!entityName) return baseMessage;
  return `${baseMessage}: ${entityName}`;
};

/**
 * Get message by action type
 */
export const getCrudMessages = (action: 'create' | 'update' | 'delete' | 'save') => {
  const map = {
    create: { success: SUCCESS_MESSAGES.CREATE, error: ERROR_MESSAGES.CREATE_FAILED },
    update: { success: SUCCESS_MESSAGES.UPDATE, error: ERROR_MESSAGES.UPDATE_FAILED },
    delete: { success: SUCCESS_MESSAGES.DELETE, error: ERROR_MESSAGES.DELETE_FAILED },
    save: { success: SUCCESS_MESSAGES.SAVE, error: ERROR_MESSAGES.SAVE_FAILED },
  };
  return map[action];
};
