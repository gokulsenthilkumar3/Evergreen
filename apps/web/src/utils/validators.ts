/**
 * EverGreen — Shared Validation Utilities
 * Centralised boundary-checked validators for all modules.
 * Every rule here corresponds to the TEST_PLAN.md specification.
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

// ─── General Utilities ────────────────────────────────────────────────────────

export const isEmptyOrWhitespace = (val: string | null | undefined): boolean =>
    !val || val.trim().length === 0;

export const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

export const safeParseFloat = (val: string | number): number => {
    const n = parseFloat(String(val));
    return isNaN(n) ? 0 : n;
};

// ─── Date Validators ──────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD (local time) */
export const todayStr = (): string =>
    new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD

/** True if an ISO date string is in the future */
export const isFutureDate = (dateStr: string): boolean => {
    return dateStr > todayStr();
};

/** True if an ISO date string is a valid date */
export const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
};

export const validateDate = (dateStr: string, allowFuture = false): ValidationResult => {
    if (!isValidDate(dateStr)) return { valid: false, message: 'Invalid date' };
    if (!allowFuture && isFutureDate(dateStr)) return { valid: false, message: 'Date cannot be in the future' };
    return { valid: true };
};

// ─── Inward Batch Validators ──────────────────────────────────────────────────

/** BVA: Bale min=1, max=9999 */
export const validateBale = (bale: string | number): ValidationResult => {
    const n = safeParseFloat(bale);
    if (n <= 0) return { valid: false, message: 'Bale count must be at least 1' };
    if (n > 9999) return { valid: false, message: 'Bale count seems unusually high (max 9999)' };
    if (!Number.isInteger(n)) return { valid: false, message: 'Bale count must be a whole number' };
    return { valid: true };
};

/** BVA: Weight min=0.01 kg, max=999,999 kg */
export const validateWeight = (kg: string | number, maxKg = 999999): ValidationResult => {
    const n = safeParseFloat(kg);
    if (n <= 0) return { valid: false, message: 'Weight must be greater than 0 kg' };
    if (n > maxKg) return { valid: false, message: `Weight cannot exceed ${maxKg.toLocaleString()} kg` };
    return { valid: true };
};

/** Warn if average bale weight is unusually low */
export const validateBaleAndWeight = (bale: string | number, kg: string | number): ValidationResult => {
    const baleN = safeParseFloat(bale);
    const kgN = safeParseFloat(kg);
    if (baleN > 0 && kgN > 0) {
        const avgBaleWeight = kgN / baleN;
        if (avgBaleWeight < 10) return { valid: true, message: `⚠️ Avg bale weight is very low (${avgBaleWeight.toFixed(1)} kg/bale)` };
        if (avgBaleWeight > 500) return { valid: true, message: `⚠️ Avg bale weight is very high (${avgBaleWeight.toFixed(1)} kg/bale)` };
    }
    return { valid: true };
};

export const validateSupplier = (supplier: string): ValidationResult => {
    if (isEmptyOrWhitespace(supplier)) return { valid: false, message: 'Supplier name is required' };
    if (supplier.trim().length < 2) return { valid: false, message: 'Supplier name must be at least 2 characters' };
    if (supplier.trim().length > 100) return { valid: false, message: 'Supplier name cannot exceed 100 characters' };
    return { valid: true };
};

// ─── Vehicle Number Validator ─────────────────────────────────────────────────

/** Indian vehicle registration: TN 01 AB 1234 or TN01AB1234 */
const VEHICLE_REGEX = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?(?:[A-Z]{1,2}[ -]?)?[0-9]{4}$/i;

export const validateVehicleNo = (vehicleNo: string): ValidationResult => {
    if (isEmptyOrWhitespace(vehicleNo)) return { valid: false, message: 'Vehicle number is required' };
    const cleaned = vehicleNo.trim();
    if (!VEHICLE_REGEX.test(cleaned)) {
        return { valid: false, message: 'Invalid format. Use: TN 01 AB 1234' };
    }
    return { valid: true };
};

// ─── Production Validators ────────────────────────────────────────────────────

/** BVA: Checks material balance: consumed ≈ produced + waste + intermediate (±0.01 tolerance) */
export const validateProductionBalance = (
    consumed: number,
    produced: number,
    waste: number,
    intermediate: number,
    toleranceKg = 0.01
): ValidationResult => {
    const diff = consumed - produced - waste - intermediate;
    if (Math.abs(diff) > toleranceKg) {
        return {
            valid: false,
            message: `Material balance mismatch: ${diff > 0 ? '+' : ''}${diff.toFixed(3)} kg. Input must equal Yarn + Waste + Intermediate.`
        };
    }
    return { valid: true };
};

export const validateBatchConsumption = (
    weight: number,
    maxWeight: number,
    batchId?: string
): ValidationResult => {
    if (weight <= 0) return { valid: false, message: 'Consumption weight must be greater than 0' };
    if (weight > maxWeight) {
        const label = batchId ? `batch ${batchId}` : 'this batch';
        return { valid: false, message: `Weight exceeds available balance for ${label} (${maxWeight.toFixed(2)} kg remaining)` };
    }
    return { valid: true };
};

export const validateEfficiency = (produced: number, consumed: number): ValidationResult => {
    if (consumed <= 0) return { valid: true };
    const eff = (produced / consumed) * 100;
    if (eff < 70) return { valid: true, message: `⚠️ Low efficiency: ${eff.toFixed(1)}%. Normal range: 80–95%` };
    if (eff > 100) return { valid: false, message: `Yarn produced cannot exceed cotton consumed (${eff.toFixed(1)}% efficiency)` };
    return { valid: true };
};

// ─── Outward Validators ───────────────────────────────────────────────────────

export const validateBagCount = (bags: number, maxBags?: number): ValidationResult => {
    if (!Number.isInteger(bags) || bags <= 0) return { valid: false, message: 'Bags must be a positive whole number' };
    if (maxBags !== undefined && bags > maxBags) {
        return { valid: false, message: `Only ${maxBags} bags available in stock` };
    }
    return { valid: true };
};

export const validateCustomerName = (name: string): ValidationResult => {
    if (isEmptyOrWhitespace(name)) return { valid: false, message: 'Customer name is required' };
    if (name.trim().length < 2) return { valid: false, message: 'Customer name must be at least 2 characters' };
    if (name.trim().length > 100) return { valid: false, message: 'Customer name too long (max 100 characters)' };
    return { valid: true };
};

// ─── Billing / Payment Validators ─────────────────────────────────────────────

/** BVA: Payment amount min=0.01, max=remaining balance */
export const validatePaymentAmount = (amount: string | number, remainingBalance: number): ValidationResult => {
    const n = safeParseFloat(amount);
    if (n <= 0) return { valid: false, message: 'Payment amount must be greater than ₹0' };
    if (n > remainingBalance + 0.01) {
        return { valid: false, message: `Amount exceeds remaining balance (₹${remainingBalance.toFixed(2)})` };
    }
    return { valid: true };
};

export const validateGST = (gst: string | number): ValidationResult => {
    const n = safeParseFloat(gst);
    if (n < 0) return { valid: false, message: 'GST cannot be negative' };
    if (n > 28) return { valid: false, message: 'GST cannot exceed 28%' };
    return { valid: true };
};

export const validateRate = (rate: string | number, fieldLabel = 'Rate'): ValidationResult => {
    const n = safeParseFloat(rate);
    if (n <= 0) return { valid: false, message: `${fieldLabel} must be greater than 0` };
    if (n > 9999) return { valid: false, message: `${fieldLabel} seems too high (max ₹9,999)` };
    return { valid: true };
};

// ─── Auth Validators ──────────────────────────────────────────────────────────

/** BVA: Username min=3, max=50 chars */
export const validateUsername = (username: string): ValidationResult => {
    if (isEmptyOrWhitespace(username)) return { valid: false, message: 'Username is required' };
    const trimmed = username.trim();
    if (trimmed.length < 3) return { valid: false, message: 'Username must be at least 3 characters' };
    if (trimmed.length > 50) return { valid: false, message: 'Username cannot exceed 50 characters' };
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
        return { valid: false, message: 'Username can only contain letters, numbers, underscores, dots, and hyphens' };
    }
    return { valid: true };
};

/** BVA: Password min=6, max=100 chars */
export const validatePassword = (password: string): ValidationResult => {
    if (!password) return { valid: false, message: 'Password is required' };
    if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
    if (password.length > 100) return { valid: false, message: 'Password is too long (max 100 characters)' };
    return { valid: true };
};

// ─── Costing Validators ───────────────────────────────────────────────────────

export const validateCostAmount = (amount: string | number): ValidationResult => {
    const n = safeParseFloat(amount);
    if (n <= 0) return { valid: false, message: 'Amount must be greater than ₹0' };
    if (n > 9999999) return { valid: false, message: 'Amount exceeds maximum limit (₹99,99,999)' };
    return { valid: true };
};

export const validateWorkingDays = (days: string | number): ValidationResult => {
    const n = safeParseFloat(days);
    if (n < 1) return { valid: false, message: 'Working days must be at least 1' };
    if (n > 31) return { valid: false, message: 'Working days cannot exceed 31' };
    if (!Number.isInteger(n)) return { valid: false, message: 'Working days must be a whole number' };
    return { valid: true };
};

// ─── Form-level Helpers ───────────────────────────────────────────────────────

/** Collect all validation errors from a map of field → ValidationResult */
export const collectErrors = (
    validations: Record<string, ValidationResult>
): Record<string, string> => {
    const errors: Record<string, string> = {};
    for (const [field, result] of Object.entries(validations)) {
        if (!result.valid && result.message) {
            errors[field] = result.message;
        }
    }
    return errors;
};

export const hasErrors = (errors: Record<string, string>): boolean =>
    Object.keys(errors).length > 0;
