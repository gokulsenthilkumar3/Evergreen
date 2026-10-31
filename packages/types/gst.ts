/**
 * GST identity rules shared by the API, imports and screens.
 * The format check is structural; it does not confirm registration with the GST portal.
 */
export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** Catalogue item kinds. Stock rules, shop publishing and imports all use this list. */
export const CATALOGUE_ITEM_TYPES = ['RAW_MATERIAL', 'YARN', 'FINISHED_GOOD', 'JOB_WORK_MATERIAL', 'SERVICE'] as const;
export type CatalogueItemType = (typeof CATALOGUE_ITEM_TYPES)[number];

/** States and union territories, spelled as stored on customers and settings. */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
] as const;

/** First two GSTIN digits. 25 (Daman and Diu) and 28 (pre-2014 Andhra Pradesh) remain on older registrations. */
export const GST_STATE_CODES: Readonly<Record<string, string>> = {
  '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh', '05': 'Uttarakhand',
  '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim',
  '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh', '24': 'Gujarat', '25': 'Dadra and Nagar Haveli and Daman and Diu',
  '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra', '28': 'Andhra Pradesh', '29': 'Karnataka',
  '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh',
};

export const normalizeGstin = (value: unknown): string => String(value ?? '').trim().toUpperCase();

export const isValidGstin = (value: unknown): boolean => GSTIN_PATTERN.test(normalizeGstin(value));

/** State registered by a GSTIN, or null for other-territory and centre codes. */
export function gstinStateName(value: unknown): string | null {
  const gstin = normalizeGstin(value);
  return GSTIN_PATTERN.test(gstin) ? GST_STATE_CODES[gstin.slice(0, 2)] ?? null : null;
}

/** Canonical spelling of a state name, ignoring case and surrounding spaces. */
export function canonicalIndianState(value: unknown): string | null {
  const wanted = String(value ?? '').trim().toLowerCase();
  return INDIAN_STATES.find(state => state.toLowerCase() === wanted) ?? null;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Indian and international numbers: 7 to 15 digits with optional +, spaces, brackets and dashes. */
export function isValidPhone(value: unknown): boolean {
  const phone = String(value ?? '').trim();
  const digits = phone.replace(/\D/g, '').length;
  return /^\+?[0-9\s()-]{7,25}$/.test(phone) && digits >= 7 && digits <= 15;
}

export interface PartyContactInput { gstin?: unknown; state?: unknown; email?: unknown; phone?: unknown; }
export interface PartyContactResult { gstin?: string | null; state?: string | null; email?: string | null; phone?: string | null; }

/**
 * Validate the tax and contact fields of a customer or supplier.
 * Only supplied keys are returned, so updates leave omitted fields alone. Empty strings clear a value.
 * `currentState` is the stored state on update, so a new GSTIN is checked against it.
 * Returns an error message instead of throwing so the API and screens can phrase it their own way.
 */
export function validatePartyContact(
  input: PartyContactInput,
  options: { currentState?: string | null } = {},
): { value: PartyContactResult; error?: string } {
  const value: PartyContactResult = {};
  const has = (key: keyof PartyContactInput) => input[key] !== undefined;
  const blank = (key: keyof PartyContactInput) => input[key] === null || String(input[key]).trim() === '';
  if (has('gstin')) {
    if (blank('gstin')) value.gstin = null;
    else if (!isValidGstin(input.gstin)) return { value, error: 'Enter a valid 15-character GSTIN, for example 33ABCDE1234F1Z5' };
    else value.gstin = normalizeGstin(input.gstin);
  }
  if (has('state')) {
    if (blank('state')) value.state = null;
    else {
      const state = canonicalIndianState(input.state);
      if (!state) return { value, error: 'Choose an Indian state or union territory' };
      value.state = state;
    }
  }
  if (has('email')) {
    if (blank('email')) value.email = null;
    else {
      const email = String(input.email).trim();
      if (email.length > 160 || !EMAIL_PATTERN.test(email)) return { value, error: 'Enter a valid email address' };
      value.email = email;
    }
  }
  if (has('phone')) {
    if (blank('phone')) value.phone = null;
    else if (!isValidPhone(input.phone)) return { value, error: 'Enter a valid phone number (7 to 15 digits)' };
    else value.phone = String(input.phone).trim();
  }
  const registeredState = value.gstin ? gstinStateName(value.gstin) : null;
  if (registeredState) {
    const effectiveState = value.state !== undefined ? value.state : options.currentState ?? null;
    if (!effectiveState) value.state = registeredState;
    else if (effectiveState !== registeredState)
      return { value, error: `GSTIN ${value.gstin} is registered in ${registeredState}, not ${effectiveState}. Correct the GSTIN or the state.` };
  }
  return { value };
}
