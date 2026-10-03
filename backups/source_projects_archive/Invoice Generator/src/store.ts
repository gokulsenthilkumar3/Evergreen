import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'js-md5';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceState {
  theme: string;
  columns: string[];
  autoCalculate: boolean;
  logo: string | null;
  signature: string | null;
  signatureType: 'upload' | 'type';
  typedSignature: string;
  accentColor: string;
  fontFamily: string;
  issuerName: string;
  issuerDetails: string;
  issuerTaxId: string;
  clientName: string;
  clientDetails: string;
  clientTaxId: string;
  
  currency: string;
  currencySymbol: string;
  
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  discountRate: number;
  notes: string;
  terms: string;

  hash: string;
  
  setField: (field: keyof InvoiceState, value: any) => void;
  addItem: () => void;
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  removeItem: (id: string) => void;
  calculateSubtotal: () => void;
  generateHash: () => void;
  resetInvoice: () => void;
}

const defaultItems: InvoiceItem[] = [
  { id: uuidv4(), description: 'Premium NextJS Website Development', quantity: 1, rate: 2500 },
  { id: uuidv4(), description: 'SEO Optimization & Marketing', quantity: 1, rate: 800 },
];

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  theme: 'light',
  columns: ['description', 'quantity', 'rate', 'amount'],
  autoCalculate: true,
  logo: null,
  signature: null,
  signatureType: 'type',
  typedSignature: 'John Doe',
  accentColor: '#3b82f6',
  fontFamily: 'Inter, sans-serif',
  
  issuerName: 'NexGen Digital Inc.',
  issuerDetails: '123 Tech Blvd, Suite 400\nSan Francisco, CA 94107\nhello@nexgen.com',
  issuerTaxId: 'US-84958372',
  clientName: 'Acme Corp',
  clientDetails: '99 Innovation Way\nAustin, TX 78701\naccounts@acmecorp.com',
  clientTaxId: 'TIN-4839201',
  
  currency: 'USD',
  currencySymbol: '$',
  
  invoiceNumber: 'INV-2023-001',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  
  items: defaultItems,
  subtotal: 3300,
  taxRate: 5,
  discountRate: 0,
  notes: 'Thank you for your business. It was a pleasure working with you.',
  terms: 'Please pay within 14 days of receiving this invoice. A late fee of 1.5% will be added after 30 days.',

  hash: '',

  setField: (field, value) => {
    set({ [field]: value });
    if (get().autoCalculate) get().calculateSubtotal();
    get().generateHash();
  },

  addItem: () => {
    set((state) => ({
      items: [...state.items, { id: uuidv4(), description: '', quantity: 1, rate: 0 }],
    }));
    if (get().autoCalculate) get().calculateSubtotal();
    get().generateHash();
  },

  updateItem: (id, field, value) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
    if (get().autoCalculate) get().calculateSubtotal();
    get().generateHash();
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    if (get().autoCalculate) get().calculateSubtotal();
    get().generateHash();
  },

  calculateSubtotal: () => {
    const items = get().items;
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    set({ subtotal });
  },

  generateHash: () => {
    const state = get();
    // A digital fingerprint of important invoice data protecting authenticity
    const dataStr = `${state.issuerName}|${state.clientName}|${state.invoiceNumber}|${state.subtotal}|${state.currency}|${state.items.length}|${state.issueDate}`;
    // @ts-ignore
    const enc = md5(dataStr);
    set({ hash: enc.substring(0, 16).toUpperCase() });
  },

  resetInvoice: () => {
    set({
      issuerName: '', issuerDetails: '', issuerTaxId: '', clientName: '', clientDetails: '', clientTaxId: '',
      items: [{ id: uuidv4(), description: '', quantity: 1, rate: 0 }], subtotal: 0
    });
  }
}));

// Initialize the hash
useInvoiceStore.getState().generateHash();
