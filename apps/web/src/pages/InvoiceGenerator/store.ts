import { create } from 'zustand';
export interface InvoiceItem { id: string; description: string; quantity: number; rate: number; }
export interface InvoiceState {
  theme: string; logo: string | null; signature: string | null; signatureType: 'upload' | 'type'; typedSignature: string;
  accentColor: string; fontFamily: string; issuerName: string; issuerDetails: string; issuerTaxId: string;
  clientName: string; clientDetails: string; clientTaxId: string; currency: string; currencySymbol: string;
  invoiceNumber: string; issueDate: string; dueDate: string; items: InvoiceItem[]; subtotal: number;
  taxRate: number; discountRate: number; notes: string; terms: string;
  setField: (field: string, value: any) => void;
  addItem: () => void;
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  removeItem: (id: string) => void;
  calculateSubtotal: () => void;
  resetInvoice: () => void;
}
let _id = 0;
const genId = () => `item-${Date.now()}-${++_id}`;
export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  theme: 'light', logo: null, signature: null, signatureType: 'type', typedSignature: 'Authorised Signatory',
  accentColor: '#059669', fontFamily: "'Inter', sans-serif",
  issuerName: 'EverGreen Textiles Pvt. Ltd.',
  issuerDetails: 'Industrial Estate, Tirupur\nTamil Nadu 641 604\ninfo@evergreen.in',
  issuerTaxId: 'GSTIN: 33AABCE1234F1Z5',
  clientName: '', clientDetails: '', clientTaxId: '',
  currency: 'INR', currencySymbol: '\u20b9',
  invoiceNumber: `INV-${new Date().getFullYear()}-001`,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
  items: [
    { id: genId(), description: 'Yarn Supply - 40s Count', quantity: 100, rate: 280 },
    { id: genId(), description: 'Processing Charges', quantity: 1, rate: 1500 },
  ],
  subtotal: 29500, taxRate: 5, discountRate: 0,
  notes: 'Thank you for your business.', terms: 'Payment due within 14 days.',
  setField: (field, value) => { set({ [field]: value } as any); get().calculateSubtotal(); },
  addItem: () => { set((s) => ({ items: [...s.items, { id: genId(), description: '', quantity: 1, rate: 0 }] })); get().calculateSubtotal(); },
  updateItem: (id, field, value) => { set((s) => ({ items: s.items.map((item) => item.id === id ? { ...item, [field]: value } : item) })); get().calculateSubtotal(); },
  removeItem: (id) => { set((s) => ({ items: s.items.filter((item) => item.id !== id) })); get().calculateSubtotal(); },
  calculateSubtotal: () => { set({ subtotal: get().items.reduce((sum, item) => sum + item.quantity * item.rate, 0) }); },
  resetInvoice: () => set({ clientName: '', clientDetails: '', clientTaxId: '', items: [{ id: genId(), description: '', quantity: 1, rate: 0 }], subtotal: 0 }),
}));
