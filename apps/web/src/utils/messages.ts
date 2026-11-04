import { uiText, uiScopedTemplate } from '../i18n';
/**
 * EverGreen — Standardized Message Constants
 * Centralized message dictionary for consistent UX across all modules
 */

// ─── Success Messages ─────────────────────────────────────────────────────────

export const SUCCESS_MESSAGES = {
  // CRUD Operations
  get CREATE() { return uiText('✓ Created successfully', 'feedback'); },
  get UPDATE() { return uiText('✓ Updated successfully', 'feedback'); },
  get DELETE() { return uiText('✓ Deleted successfully', 'feedback'); },
  get SAVE() { return uiText('✓ Saved successfully', 'feedback'); },
  get SUBMIT() { return uiText('✓ Submitted successfully', 'feedback'); },
  get CANCEL() { return uiText('✓ Cancelled successfully', 'feedback'); },

  // Export Operations
  get EXPORT_EXCEL() { return uiText('✓ Exported to Excel successfully', 'feedback'); },
  get EXPORT_PDF() { return uiText('✓ Exported to PDF successfully', 'feedback'); },
  get EXPORT_CSV() { return uiText('✓ Exported to CSV successfully', 'feedback'); },
  get EMAIL_SENT() { return uiText('✓ Email sent successfully', 'feedback'); },
  get PRINT() { return uiText('✓ Document sent to printer', 'feedback'); },

  // Auth Operations
  get LOGIN() { return uiText('✓ Welcome back!', 'feedback'); },
  get LOGOUT() { return uiText('✓ Logged out successfully', 'feedback'); },
  get PASSWORD_CHANGE() { return uiText('✓ Password changed successfully', 'feedback'); },
  get USER_CREATE() { return uiText('✓ User created successfully', 'feedback'); },
  get USER_UPDATE() { return uiText('✓ User updated successfully', 'feedback'); },
  get USER_DELETE() { return uiText('✓ User deleted successfully', 'feedback'); },

  // Data Operations
  get IMPORT() { return uiText('✓ Data imported successfully', 'feedback'); },
  get SYNC() { return uiText('✓ Data synchronized successfully', 'feedback'); },
  get BACKUP() { return uiText('✓ Backup created successfully', 'feedback'); },
  get RESTORE() { return uiText('✓ Data restored successfully', 'feedback'); },

  // Workflow
  get PRODUCTION_SAVED() { return uiText('✓ Production entry saved successfully', 'feedback'); },
  get INWARD_SAVED() { return uiText('✓ Inward batch saved successfully', 'feedback'); },
  get OUTWARD_SAVED() { return uiText('✓ Outward dispatch saved successfully', 'feedback'); },
  get WASTE_PROCESSED() { return uiText('✓ Waste processed successfully', 'feedback'); },
  get INVOICE_CREATED() { return uiText('✓ Invoice created successfully', 'feedback'); },
  get INVOICE_DELETED() { return uiText('✓ Invoice deleted successfully', 'feedback'); },
  get PAYMENT_RECORDED() { return uiText('✓ Payment recorded successfully', 'feedback'); },
  get COSTING_SAVED() { return uiText('✓ Cost entry saved successfully', 'feedback'); },

  // Settings
  get SETTINGS_SAVED() { return uiText('✓ Settings saved successfully', 'feedback'); },
  get COMPANY_INFO_UPDATED() { return uiText('✓ Company information updated', 'feedback'); },
  get RATES_UPDATED() { return uiText('✓ Rates updated successfully', 'feedback'); },
};

// ─── Error Messages ──────────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  // Generic Errors
  get GENERIC() { return uiText('✗ Something went wrong. Please try again.', 'feedback'); },
  get NETWORK() { return uiText('✗ Network error. Please check your connection.', 'feedback'); },
  get TIMEOUT() { return uiText('✗ Request timed out. Please try again.', 'feedback'); },
  get SERVER_ERROR() { return uiText('✗ Server error. Please contact support.', 'feedback'); },
  get NOT_FOUND() { return uiText('✗ Resource not found', 'feedback'); },
  get UNAUTHORIZED() { return uiText('✗ You are not authorized to perform this action', 'feedback'); },
  get FORBIDDEN() { return uiText('✗ Access denied', 'feedback'); },
  get VALIDATION_FAILED() { return uiText('✗ Please fix the errors above', 'feedback'); },

  // CRUD Errors
  get CREATE_FAILED() { return uiText('✗ Failed to create', 'feedback'); },
  get UPDATE_FAILED() { return uiText('✗ Failed to update', 'feedback'); },
  get DELETE_FAILED() { return uiText('✗ Failed to delete', 'feedback'); },
  get SAVE_FAILED() { return uiText('✗ Failed to save', 'feedback'); },
  get FETCH_FAILED() { return uiText('✗ Failed to fetch data', 'feedback'); },

  // Data Validation
  REQUIRED_FIELD: (field: string) => uiScopedTemplate('feedback')`✗ ${field} is required`,
  INVALID_FORMAT: (field: string) => uiScopedTemplate('feedback')`✗ ${field} format is invalid`,
  get INVALID_DATE() { return uiText('✗ Invalid date selected', 'feedback'); },
  get FUTURE_DATE() { return uiText('✗ Date cannot be in the future', 'feedback'); },
  get PAST_DATE() { return uiText('✗ Date cannot be in the past', 'feedback'); },
  get DUPLICATE_ENTRY() { return uiText('✗ This entry already exists', 'feedback'); },
  get DUPLICATE_INVOICE() { return uiText('✗ Invoice number already exists', 'feedback'); },

  // Numeric Validation
  get INVALID_NUMBER() { return uiText('✗ Please enter a valid number', 'feedback'); },
  get NEGATIVE_NUMBER() { return uiText('✗ Value cannot be negative', 'feedback'); },
  get ZERO_NOT_ALLOWED() { return uiText('✗ Value must be greater than zero', 'feedback'); },
  MAX_EXCEEDED: (max: number) => uiScopedTemplate('feedback')`✗ Value cannot exceed ${max}`,
  MIN_REQUIRED: (min: number) => uiScopedTemplate('feedback')`✗ Value must be at least ${min}`,

  // Business Logic
  get NO_DATA() { return uiText('✗ No data available', 'feedback'); },
  get INVALID_INPUT() { return uiText('✗ Please provide valid input', 'feedback'); },
  get INVALID_QUANTITY() { return uiText('✗ Invalid quantity', 'feedback'); },
  get LOW_STOCK_THRESHOLD() { return uiText('✗ Low stock threshold must be greater than 0 when alerts are enabled', 'feedback'); },
  get EXCEEDS_AVAILABLE_BALES() { return uiText('✗ Total bales exceeds available bales', 'feedback'); },
  get EXCEEDS_AVAILABLE_WEIGHT() { return uiText('✗ Total weight exceeds available weight', 'feedback'); },
  get INSUFFICIENT_STOCK() { return uiText('✗ Insufficient stock available', 'feedback'); },
  get BATCH_NOT_FOUND() { return uiText('✗ Batch not found', 'feedback'); },
  get INVALID_BATCH_DATE() { return uiText('✗ Batch date is after production date', 'feedback'); },
  get MATERIAL_BALANCE_MISMATCH() { return uiText('✗ Material balance mismatch: Input must equal Yarn + Waste + Intermediate', 'feedback'); },
  get INVOICE_PAID_DELETE() { return uiText('✗ Cannot delete paid invoices. Delete payments first.', 'feedback'); },
  get COSTING_DEPENDENCY() { return uiText('✗ Please delete dependent costing entries first', 'feedback'); },
  get OUTWARD_DEPENDENCY() { return uiText('✗ Please delete dependent outward entries first', 'feedback'); },

  // Auth Errors
  get INVALID_CREDENTIALS() { return uiText('✗ Invalid username or password', 'feedback'); },
  get SESSION_EXPIRED() { return uiText('✗ Session expired. Please login again.', 'feedback'); },
  get ACCOUNT_LOCKED() { return uiText('✗ Account locked. Please contact admin.', 'feedback'); },
  get USER_EXISTS() { return uiText('✗ Username already exists', 'feedback'); },
  get WEAK_PASSWORD() { return uiText('✗ Password must be at least 6 characters', 'feedback'); },

  // Export/Email
  get EXPORT_FAILED() { return uiText('✗ Export failed. Please try again.', 'feedback'); },
  get EMAIL_FAILED() { return uiText('✗ Failed to send email', 'feedback'); },
  get PRINT_FAILED() { return uiText('✗ Print failed', 'feedback'); },

  // File Operations
  FILE_TOO_LARGE: (max: string) => uiScopedTemplate('feedback')`✗ File size exceeds ${max} limit`,
  get FILE_TOO_LARGE_GENERIC() { return uiText('✗ File size exceeds limit', 'feedback'); },
  get INVALID_FILE_TYPE() { return uiText('✗ Invalid file type', 'feedback'); },
  get UPLOAD_FAILED() { return uiText('✗ File upload failed', 'feedback'); },
};

// ─── Warning Messages ────────────────────────────────────────────────────────

export const WARNING_MESSAGES = {
  // Confirmation
  get UNSAVED_CHANGES() { return uiText('⚠ You have unsaved changes. Are you sure you want to leave?', 'feedback'); },
  get DELETE_CONFIRM() { return uiText('⚠ This action cannot be undone.', 'feedback'); },
  BULK_DELETE: (count: number) => uiScopedTemplate('feedback')`⚠ You are about to delete ${count} items.`,

  // Data Quality
  LOW_STOCK: (item: string, qty: number) => uiScopedTemplate('feedback')`⚠ Low stock alert: ${item} (${qty} remaining)`,
  LOW_EFFICIENCY: (eff: number) => uiScopedTemplate('feedback')`⚠ Low efficiency: ${eff}%. Normal range: 80-95%`,
  HIGH_WASTE: (waste: number) => uiScopedTemplate('feedback')`⚠ High waste percentage: ${waste}%`,
  AVG_BALE_WEIGHT_LOW: (avg: number) => uiScopedTemplate('feedback')`⚠ Avg bale weight is very low (${avg.toFixed(1)} kg/bale)`,
  AVG_BALE_WEIGHT_HIGH: (avg: number) => uiScopedTemplate('feedback')`⚠ Avg bale weight is very high (${avg.toFixed(1)} kg/bale)`,

  // Business Logic
  get FUTURE_DATE_SELECTED() { return uiText('⚠ You selected a future date', 'feedback'); },
  get PARTIAL_PAYMENT() { return uiText('⚠ Partial payment recorded. Balance remains.', 'feedback'); },
  get INVOICE_OVERDUE() { return uiText('⚠ Invoice is overdue', 'feedback'); },
  get DUPLICATE_COUNTS() { return uiText('⚠ Duplicate yarn counts. Please combine rows with the same count.', 'feedback'); },
  INSUFFICIENT_STOCK_DETAIL: (item: string, bags: number, kg: number) => uiScopedTemplate('feedback')`⚠ Insufficient stock for ${item}. Available: ${bags} bags (${kg.toFixed(2)} kg)`,

  // Info
  get NO_DATA_RANGE() { return uiText('⚠ No data found for selected date range', 'feedback'); },
  get PRODUCTION_REQUIRED() { return uiText('⚠ No production records found for selected date', 'feedback'); },
};

// ─── Info Messages ───────────────────────────────────────────────────────────

export const INFO_MESSAGES = {
  // Loading
  get LOADING() { return uiText('Loading...', 'feedback'); },
  get SAVING() { return uiText('Saving...', 'feedback'); },
  get PROCESSING() { return uiText('Processing...', 'feedback'); },
  get FETCHING() { return uiText('Fetching data...', 'feedback'); },

  // Empty States
  get NO_DATA() { return uiText('No data available', 'feedback'); },
  get NO_RESULTS() { return uiText('No results found', 'feedback'); },
  get NO_HISTORY() { return uiText('No history records', 'feedback'); },
  get NO_INVOICES() { return uiText('No invoices found', 'feedback'); },
  get NO_PAYMENTS() { return uiText('No payment records', 'feedback'); },

  // Help Text
  get TIP_SAVE_SHORTCUT() { return uiText('Tip: Press Ctrl+S to save', 'feedback'); },
  get TIP_SEARCH_SHORTCUT() { return uiText('Tip: Press Ctrl+K to search', 'feedback'); },
  get TIP_FILTER() { return uiText('Use filters to narrow results', 'feedback'); },
  get TIP_EXPORT() { return uiText('Export data for offline analysis', 'feedback'); },

  // Status
  get CHANGES_SAVED() { return uiText('Changes saved', 'feedback'); },
  get AUTO_SAVED() { return uiText('Auto-saved', 'feedback'); },
  get SESSION_ACTIVE() { return uiText('Session active', 'feedback'); },
  LAST_UPDATED: (date: string) => uiScopedTemplate('feedback')`Last updated: ${date}`,

  // Business Info
  PAST_DATE_STOCK_INFO: (date: string) => uiScopedTemplate('feedback')`ℹ Adding outward for ${date} — only stock produced on or before that date counts.`,
  get EDIT_WORKFLOW_DELETE_CREATE() { return uiText('ℹ Editing will delete the old entry and create a new one', 'feedback'); },
  get OPENING_EMAIL() { return uiText('ℹ Opening email client...', 'feedback'); },
};

// ─── Confirmation Dialog Titles ────────────────────────────────────────────────

export const CONFIRM_TITLES = {
  get DELETE() { return uiText('Confirm Delete', 'feedback'); },
  get DELETE_USER() { return uiText('Delete User', 'feedback'); },
  get DELETE_INVOICE() { return uiText('Delete Invoice', 'feedback'); },
  get DELETE_PRODUCTION() { return uiText('Delete Production Entry', 'feedback'); },
  get DELETE_PAYMENT() { return uiText('Delete Payment', 'feedback'); },
  get BULK_DELETE() { return uiText('Confirm Bulk Delete', 'feedback'); },
  get SAVE_CHANGES() { return uiText('Save Changes?', 'feedback'); },
  get DISCARD_CHANGES() { return uiText('Discard Changes?', 'feedback'); },
  get LOGOUT() { return uiText('Confirm Logout', 'feedback'); },
  get CANCEL_OPERATION() { return uiText('Cancel Operation', 'feedback'); },
  get UPDATE_SETTINGS() { return uiText('Update Settings', 'feedback'); },
};

// ─── Confirmation Messages ────────────────────────────────────────────────────

export const CONFIRM_MESSAGES = {
  get DELETE() { return uiText('Are you sure you want to delete this item? This action cannot be undone.', 'feedback'); },
  DELETE_USER: (username: string) => uiScopedTemplate('feedback')`Are you sure you want to delete user "${username}"?`,
  DELETE_INVOICE: (invNo: string) => uiScopedTemplate('feedback')`Delete invoice ${invNo}? Associated payments will also be deleted.`,
  get DELETE_PRODUCTION() { return uiText('Deleting production will revert inventory changes. Continue?', 'feedback'); },
  get DELETE_PAYMENT() { return uiText('Delete this payment? The invoice status will be updated.', 'feedback'); },
  BULK_DELETE: (count: number) => uiScopedTemplate('feedback')`You are about to permanently delete ${count} items. This cannot be undone.`,
  get UNSAVED_CHANGES() { return uiText('You have unsaved changes. Save before leaving?', 'feedback'); },
  get DISCARD_CHANGES() { return uiText('Discard all changes and return?', 'feedback'); },
  get LOGOUT() { return uiText('Are you sure you want to log out?', 'feedback'); },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Format error message with API response
 */
export const formatApiError = (error: any, fallback = ERROR_MESSAGES.GENERIC): string => {
  if (!error) return fallback;
  const translatedError=(value:unknown)=>{const plain=String(value),marked=`✗ ${plain}`,translated=uiText(marked,'feedback');return translated!==marked?translated:`✗ ${uiText(plain,'feedback')}`;};

  // Handle API error response
  if (error.response?.data?.message) {
    const messages=Array.isArray(error.response.data.message)?error.response.data.message:[error.response.data.message];
    return messages.map(translatedError).join('. ');
  }

  // Handle array of errors
  if (Array.isArray(error.response?.data)) {
    return error.response.data.map((e: any) => translatedError(e.message || e)).join(', ');
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
