import { z } from 'zod';

export const createSupplierSchema = z.object({
  // Basic Information (Mandatory in DB, Optional in API for legacy support)
  supplierCode: z.string().nullish(), // Will be generated
  name: z.string().min(1, 'Name is required'),
  supplierType: z.enum([
    'Raw Cotton Waste Supplier',
    'Equipment Supplier',
    'Chemical Supplier',
    'Packaging Supplier',
    'Service Provider',
  ]).nullish(),
  businessType: z.enum(['Manufacturer', 'Trader', 'Wholesaler', 'Broker', 'Scrap Dealer']).nullish(),
  registrationDate: z.string().datetime().nullish(),
  status: z.enum(['Active', 'Inactive', 'On Hold', 'Blacklisted', 'Pending Approval']).default('Active'),

  // Primary Contact (Mandatory in DB, Optional in API)
  primaryContactName: z.string().nullish(),
  primaryContactDesignation: z.string().nullish(),
  primaryContactMobile: z.string().nullish(),
  primaryContactLandline: z.string().nullish(),
  primaryContactEmail: z.string().email('Invalid email').nullish(),
  primaryContactWhatsApp: z.string().nullish(),

  // Secondary Contact (Optional)
  secondaryContactName: z.string().nullish(),
  secondaryContactNumber: z.string().nullish(),

  // Registered Address (Mandatory in DB, Optional in API)
  registeredAddressLine1: z.string().nullish(),
  registeredAddressLine2: z.string().nullish(),
  registeredCity: z.string().nullish(),
  registeredState: z.string().nullish(),
  registeredPinCode: z.string().nullish(),
  registeredCountry: z.string().nullish(),
  registeredLandmark: z.string().nullish(),

  // Optional addresses
  warehouseAddressLine1: z.string().nullish(),
  warehouseAddressLine2: z.string().nullish(),
  warehouseCity: z.string().nullish(),
  warehouseState: z.string().nullish(),
  warehousePinCode: z.string().nullish(),
  warehouseCountry: z.string().nullish(),
  warehouseLandmark: z.string().nullish(),
  billingAddressLine1: z.string().nullish(),
  billingAddressLine2: z.string().nullish(),
  billingCity: z.string().nullish(),
  billingState: z.string().nullish(),
  billingPinCode: z.string().nullish(),
  billingCountry: z.string().nullish(),
  billingLandmark: z.string().nullish(),

  // Internal Management
  createdBy: z.string().nullish(),
  approvedBy: z.string().nullish(),
  assignedTo: z.string().nullish(),
  visibilityLevel: z.enum(['Public', 'Restricted']).default('Public'),
  notes: z.string().max(2000).nullish(),

  // Legacy fields (for backward compatibility)
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  rating: z.number().int().min(0).max(5).optional().nullable(),
  notesLegacy: z.string().optional().nullable(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierAccountSchema = z.object({
  bankAccountHolderName: z.string().nullish(),
  bankName: z.string().nullish(),
  bankAccountNumber: z.string().nullish(),
  bankAccountType: z.string().nullish(),
  bankIfscCode: z.string().nullish(),
  bankBranchName: z.string().nullish(),
  bankUpiId: z.string().nullish(),
  panNumber: z.string().nullish(),
  gstNumber: z.string().nullish(),
  tdsRate: z.number().nullish(),
});

