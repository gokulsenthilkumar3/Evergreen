/** Canonical roles shared by every EverGreen client and service. */
export const USER_ROLES = ['VIEWER', 'MODIFIER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const YARN_COUNTS = ['2', '4', '6', '8', '10'] as const;
export type YarnCount = (typeof YARN_COUNTS)[number];

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  name?: string | null;
  email?: string;
  role: UserRole;
}

export interface SessionRecord {
  id: string;
  userId: number;
  ipAddress?: string | null;
  location?: string | null;
  device?: string | null;
  userAgent?: string | null;
  isValid: boolean;
  createdAt: string;
  lastActive: string;
}

export interface StockMovement {
  id: number;
  itemId: number;
  quantity: number;
  reservedQty: number;
  movementType: string;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface InvoiceLine {
  itemId?: number | null;
  description: string;
  hsnSac?: string | null;
  uom: string;
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}

export interface CustomerSummary {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  balance: number;
}

export interface TodayDashboardSummary {
  date: string;
  productionByCount: Array<{ count: YarnCount | string; weight: number; bags: number }>;
  totalProduced: number;
  totalCost: number;
  costPerKg: number;
  waste: {
    blowRoom: number;
    carding: number;
    oe: number;
    others: number;
    total: number;
  };
}
