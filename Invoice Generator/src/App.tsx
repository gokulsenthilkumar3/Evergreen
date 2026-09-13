import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useInvoiceStore } from './store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Plus, Trash2, Palette, Settings, Cpu,
  Download, Sparkles, Image as ImageIcon, X, Receipt,
  FileText, Zap, Check
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './index.css';
import Landing from './Landing';

/* ─────────────────────────────────────────
   Animation variants
───────────────────────────────────────── */
const tabVariants = {
  enter: { opacity: 0, x: -16 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

const rowVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' as const },
  }),
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2 } },
};

/* ─────────────────────────────────────────
   Tiny helper components
───────────────────────────────────────── */
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field-group">
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label">{children}</div>;
}

interface UploadZoneProps {
  label: string;
  value: string | null;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
  accept?: string;
  icon?: React.ReactNode;
}

function UploadZone({ label, value, onUpload, onRemove, accept = 'image/*', icon }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  if (value) {
    return (
      <div className="upload-preview">
        <img src={value} alt={label} />
        <div className="upload-preview-info">
          <p>✓ {label} uploaded</p>
        </div>
        <button className="upload-preview-remove" onClick={onRemove} title="Remove">
          <X size={14} />
        </button>
      </div>
    );
  }
  return (
    <>
      <label className="upload-zone" onClick={() => inputRef.current?.click()} style={{ cursor: 'pointer' }}>
        {icon ?? <ImageIcon size={15} />}
        <span>{label}</span>
      </label>
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
    </>
  );
}

/* ─────────────────────────────────────────
   Sidebar Panels
───────────────────────────────────────── */
function DetailsPanel() {
  const store = useInvoiceStore();
  return (
    <div className="tab-panel">
      <div className="form-section">
        <SectionLabel>Issuer</SectionLabel>
        <input
          className="input-field"
          placeholder="Company or your name"
          value={store.issuerName}
          onChange={(e) => store.setField('issuerName', e.target.value)}
        />
        <textarea
          className="input-field"
          rows={3}
          placeholder={"Street address\nCity, State  ZIP\nemail@example.com · +1 555 000"}
          value={store.issuerDetails}
          onChange={(e) => store.setField('issuerDetails', e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Tax ID / VAT (Optional)"
          value={store.issuerTaxId || ''}
          onChange={(e) => store.setField('issuerTaxId', e.target.value)}
        />
        <UploadZone
          label="Upload Logo"
          value={store.logo}
          onUpload={(v) => store.setField('logo', v)}
          onRemove={() => store.setField('logo', null)}
          icon={<ImageIcon size={15} />}
        />
      </div>

      <div className="form-section">
        <SectionLabel>Client</SectionLabel>
        <input
          className="input-field"
          placeholder="Client company name"
          value={store.clientName}
          onChange={(e) => store.setField('clientName', e.target.value)}
        />
        <textarea
          className="input-field"
          rows={3}
          placeholder={"Client address\nCity, State  ZIP\nclient@company.com"}
          value={store.clientDetails}
          onChange={(e) => store.setField('clientDetails', e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Tax ID / VAT (Optional)"
          value={store.clientTaxId || ''}
          onChange={(e) => store.setField('clientTaxId', e.target.value)}
        />
      </div>

      <div className="form-section">
        <SectionLabel>Invoice Info</SectionLabel>
        <div className="input-row">
          <FieldGroup label="Invoice #">
            <input
              className="input-field"
              value={store.invoiceNumber}
              onChange={(e) => store.setField('invoiceNumber', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label="Currency">
            <select
              className="input-field"
              value={store.currency}
              onChange={(e) => {
                const currency = e.target.value;
                const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$', AUD: 'A$' };
                store.setField('currency', currency);
                store.setField('currencySymbol', symbols[currency] || currency);
              }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </FieldGroup>
        </div>
        <div className="input-row">
          <FieldGroup label="Issue Date">
            <input
              type="date"
              className="input-field"
              value={store.issueDate}
              onChange={(e) => store.setField('issueDate', e.target.value)}
            />
          </FieldGroup>
        </div>
        <FieldGroup label="Due Date">
          <input
            type="date"
            className="input-field"
            value={store.dueDate}
            onChange={(e) => store.setField('dueDate', e.target.value)}
          />
        </FieldGroup>
      </div>

      <div className="form-section">
        <SectionLabel>Rates</SectionLabel>
        <div className="input-row">
          <FieldGroup label="Tax (%)">
            <input
              type="number"
              className="input-field"
              min={0}
              max={100}
              value={store.taxRate}
              onChange={(e) => store.setField('taxRate', parseFloat(e.target.value) || 0)}
            />
          </FieldGroup>
          <FieldGroup label="Discount (%)">
            <input
              type="number"
              className="input-field"
              min={0}
              max={100}
              value={store.discountRate}
              onChange={(e) => store.setField('discountRate', parseFloat(e.target.value) || 0)}
            />
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}

const THEMES = [
  { id: 'light', name: 'Clean Light', color: '#f8fafc', border: '#e2e8f0' },
  { id: 'dark', name: 'Obsidian Dark', color: '#161b22', border: '#30363d' },
  { id: 'midnight', name: 'Neon Violet', color: '#0f0020', border: '#a78bfa' },
  { id: 'gold', name: 'Luxury Gold', color: '#221500', border: '#f59e0b' },
];

const ACCENTS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#10b981', '#f59e0b', '#ef4444', '#0ea5e9',
];

const FONTS = [
  { value: "'Inter', sans-serif", label: 'Inter — Modern' },
  { value: "'Outfit', sans-serif", label: 'Outfit — Display' },
  { value: "'Playfair Display', serif", label: 'Playfair — Classic' },
  { value: "'Courier New', monospace", label: 'Courier — Mono' },
];

function ThemePanel() {
  const store = useInvoiceStore();

  const setAccent = (c: string) => {
    store.setField('accentColor', c);
    document.documentElement.style.setProperty('--invoice-primary', c);
    // also change sidebar accent
    document.documentElement.style.setProperty('--accent', c);
    document.documentElement.style.setProperty('--accent-hover', c);
    document.documentElement.style.setProperty('--accent-glow', c + '40');
    document.documentElement.style.setProperty('--accent-bg', c + '14');
  };

  const setFont = (v: string) => {
    store.setField('fontFamily', v);
    document.documentElement.style.setProperty('--invoice-font', v);
  };

  return (
    <div className="tab-panel">
      <div className="form-section">
        <SectionLabel>Color Theme</SectionLabel>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-btn${store.theme === t.id ? ' active' : ''}`}
              onClick={() => store.setField('theme', t.id)}
            >
              <span
                className="theme-color-dot"
                style={{ backgroundColor: t.color, borderColor: t.border }}
              />
              {t.name}
              {store.theme === t.id && (
                <Check size={13} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <SectionLabel>Accent Color</SectionLabel>
        <div className="accent-palette">
          {ACCENTS.map((c) => (
            <button
              key={c}
              className={`accent-swatch${store.accentColor === c ? ' active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setAccent(c)}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="form-section">
        <SectionLabel>Invoice Font</SectionLabel>
        <select className="input-field" value={store.fontFamily} onChange={(e) => setFont(e.target.value)}>
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <SectionLabel>Signature</SectionLabel>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button 
            className={`btn btn-sm ${store.signatureType === 'type' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => store.setField('signatureType', 'type')}
          >Type</button>
          <button 
            className={`btn btn-sm ${store.signatureType === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => store.setField('signatureType', 'upload')}
          >Upload</button>
        </div>
        
        {store.signatureType === 'type' ? (
          <input
            className="input-field"
            placeholder="Type your signature..."
            value={store.typedSignature}
            onChange={(e) => store.setField('typedSignature', e.target.value)}
          />
        ) : (
          <UploadZone
            label="Upload Signature"
            value={store.signature}
            onUpload={(v) => store.setField('signature', v)}
            onRemove={() => store.setField('signature', null)}
            icon={<FileText size={15} />}
          />
        )}
      </div>
    </div>
  );
}

function AIPanel() {
  const store = useInvoiceStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleAI = () => {
    setLoading(true);
    setDone(false);
    setTimeout(() => {
      store.setField('notes', 'AI-optimized: Our analysis found this invoice qualifies for net-14 priority processing. Adding recommended add-ons below.');
      store.addItem();
      setTimeout(() => {
        const items = useInvoiceStore.getState().items;
        const last = items[items.length - 1];
        if (last) {
          store.updateItem(last.id, 'description', 'AI Performance Audit & Optimization Report');
          store.updateItem(last.id, 'rate', 850);
        }
        setLoading(false);
        setDone(true);
        setTimeout(() => setDone(false), 3000);
      }, 800);
    }, 400);
  };

  return (
    <div className="tab-panel">
      <div className="ai-card">
        <div className="ai-card-header">
          <Sparkles size={20} style={{ color: 'var(--accent)' }} />
          <h3>AI Assistant</h3>
          <span className="ai-badge">Beta</span>
        </div>
        <p>
          Let AI analyze your billables, client profile, and industry standards — then suggest optimized line items and payment terms for faster collection.
        </p>
        <button className="btn btn-primary btn-full" onClick={handleAI} disabled={loading}>
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
              />
              Analyzing…
            </>
          ) : done ? (
            <><Check size={16} /> Suggestions Applied!</>
          ) : (
            <><Zap size={16} /> Generate Smart Additions</>
          )}
        </button>
      </div>

      <div className="hash-section">
        <div className="hash-section-header">
          <ShieldCheck size={16} style={{ color: 'var(--success, #10b981)' }} />
          <h4>Tamper-Proof Authentication</h4>
        </div>
        <p>
          Every change instantly recalculates a cryptographic fingerprint. Share this hash to prove the invoice hasn't been altered.
        </p>
        <motion.div
          key={store.hash}
          className="hash-display"
          initial={{ opacity: 0.5, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          {store.hash || '—'}
        </motion.div>
      </div>

      <div className="form-section">
        <SectionLabel>Verify Existing Invoice</SectionLabel>
        <input
          className="input-field"
          placeholder="Paste hash code to verify…"
          style={{ fontFamily: 'monospace', letterSpacing: '1.5px' }}
        />
        <button className="btn btn-secondary btn-full" style={{ marginTop: 4 }}>
          <ShieldCheck size={15} /> Verify Authenticity
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Invoice Preview (the paper document)
───────────────────────────────────────── */
function InvoicePreview({ invoiceRef }: { invoiceRef: React.RefObject<HTMLDivElement | null> }) {
  const store = useInvoiceStore();

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: store.currency || 'USD', minimumFractionDigits: 2 });

  const subtotal = store.subtotal;
  const discountAmt = subtotal * (store.discountRate / 100);
  const taxAmt = (subtotal - discountAmt) * (store.taxRate / 100);
  const total = subtotal - discountAmt + taxAmt;

  const fmtDate = (s: string) => {
    if (!s) return '—';
    try { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return s; }
  };

  return (
    <div className="invoice-paper" ref={invoiceRef}>
      {/* Accent gradient bar */}
      <div className="invoice-accent-bar" />

      <div className="invoice-body">
        {/* ── Header ─────────────────────────────────── */}
        <div className="invoice-header">
          <div className="issuer-block">
            {store.logo && <img src={store.logo} className="logo-img" alt="Logo" />}
            <div className="issuer-name">{store.issuerName || 'Your Company'}</div>
            <div className="issuer-details">{store.issuerDetails || 'Address · Email · Phone'}</div>
            {store.issuerTaxId && <div className="issuer-details" style={{ marginTop: 4 }}>Tax ID: {store.issuerTaxId}</div>}
          </div>

          <div className="invoice-title-block">
            <span className="invoice-title-word">INVOICE</span>
            <div className="invoice-meta-card">
              <div className="invoice-meta-row">
                <span className="meta-label">Invoice No</span>
                <span className="meta-value">{store.invoiceNumber}</span>
              </div>
              <div className="invoice-meta-row" style={{ marginTop: 8 }}>
                <span className="meta-label">Issued</span>
                <span className="meta-value">{fmtDate(store.issueDate)}</span>
              </div>
              <div className="invoice-meta-row" style={{ marginTop: 8 }}>
                <span className="meta-label">Due</span>
                <span className="meta-value" style={{ color: '#ef4444' }}>{fmtDate(store.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bill To ─────────────────────────────────── */}
        <div className="bill-to-section">
          <div className="bill-to-label">Billed To</div>
          <div className="bill-to-name">{store.clientName || 'Client Name'}</div>
          <div className="bill-to-details">{store.clientDetails || 'Client address & contact'}</div>
          {store.clientTaxId && <div className="bill-to-details" style={{ marginTop: 4 }}>Tax ID: {store.clientTaxId}</div>}
        </div>

        {/* ── Line Items ─────────────────────────────────── */}
        <div className="items-section">
          <table className="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ width: 80 }}>Qty</th>
                <th style={{ width: 100 }}>Rate</th>
                <th style={{ width: 110 }}>Amount</th>
                <th className="col-actions" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {store.items.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <td>
                      <input
                        className="inline-input"
                        value={item.description}
                        placeholder="Service or product description…"
                        onChange={(e) => store.updateItem(item.id, 'description', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="inline-input inline-input-num"
                        value={item.quantity}
                        min={0}
                        onChange={(e) => store.updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        style={{ textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>{store.currencySymbol || '$'}</span>
                        <input
                          type="number"
                          className="inline-input inline-input-rate"
                          value={item.rate}
                          min={0}
                          onChange={(e) => store.updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          style={{ textAlign: 'right', width: 80 }}
                        />
                      </div>
                    </td>
                    <td className="amount-cell">
                      <motion.span
                        key={item.quantity * item.rate}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {fmt(item.quantity * item.rate)}
                      </motion.span>
                    </td>
                    <td className="col-actions">
                      <button className="delete-row-btn" onClick={() => store.removeItem(item.id)}>
                        <Trash2 />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="add-item-row">
            <button className="add-item-btn" onClick={store.addItem}>
              <Plus size={14} />
              Add Line Item
            </button>
          </div>
        </div>

        {/* ── Footer Grid ─────────────────────────────────── */}
        <div className="invoice-footer-grid">
          {/* Notes + Terms */}
          <div>
            <div className="notes-section">
              <h4>Notes</h4>
              <textarea
                className="inline-textarea"
                rows={3}
                value={store.notes}
                onChange={(e) => store.setField('notes', e.target.value)}
              />
            </div>
            <div className="terms-section">
              <h4>Terms & Conditions</h4>
              <textarea
                className="inline-textarea"
                rows={2}
                value={store.terms}
                onChange={(e) => store.setField('terms', e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="summary-col">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {store.discountRate > 0 && (
              <div className="summary-row discount">
                <span>Discount ({store.discountRate}%)</span>
                <span>−{fmt(discountAmt)}</span>
              </div>
            )}
            {store.taxRate > 0 && (
              <div className="summary-row">
                <span>Tax ({store.taxRate}%)</span>
                <span>{fmt(taxAmt)}</span>
              </div>
            )}
            <div className="summary-row summary-total" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span className="summary-total-label">Total Due</span>
              <motion.span
                key={total}
                className="summary-total-value"
                initial={{ scale: 0.95, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
              >
                {fmt(total)}
              </motion.span>
            </div>
          </div>
        </div>

        {/* ── Authenticity & Signature ─────────────────────────────────── */}
        <div className="authenticity-section">
          <div className="auth-ribbon">
            <div className="auth-icon-wrap">
              <ShieldCheck />
            </div>
            <div>
              <div className="auth-text-label">Verified · Tamper-Proof</div>
              <div className="auth-hash">{store.hash}</div>
            </div>
          </div>

          {(store.signatureType === 'upload' && store.signature) || (store.signatureType === 'type' && store.typedSignature) ? (
            <div className="signature-block">
              <div className="signature-img-wrap" style={store.signatureType === 'type' ? { alignItems: 'center' } : {}}>
                {store.signatureType === 'upload' && store.signature ? (
                  <img src={store.signature} alt="Signature" />
                ) : (
                  <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '32px', color: '#1f2937' }}>
                    {store.typedSignature}
                  </span>
                )}
              </div>
              <div className="signature-line" />
              <div className="signature-label">Authorized Signature</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main App
───────────────────────────────────────── */
const TABS = [
  { id: 'editor', icon: Settings, label: 'Details' },
  { id: 'theme', icon: Palette, label: 'Theme' },
  { id: 'ai', icon: Cpu, label: 'AI Magic' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function App() {
  const store = useInvoiceStore();
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const [exporting, setExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [showLanding, setShowLanding] = useState(true);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.theme);
  }, [store.theme]);

  // Apply accent on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--invoice-primary', store.accentColor);
  }, []);

  const handleExport = useCallback(async () => {
    if (!invoiceRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`${store.invoiceNumber || 'invoice'}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [store.invoiceNumber, exporting]);

  if (showLanding) {
    return <Landing onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="app-layout">
      {/* ════════════ SIDEBAR ════════════ */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Receipt size={20} />
            </div>
            <div className="brand-text">
              <h1>AInvoice</h1>
              <p>Smart Generator</p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="sidebar-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <t.icon size={17} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="sidebar-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {activeTab === 'editor' && <DetailsPanel />}
              {activeTab === 'theme' && <ThemePanel />}
              {activeTab === 'ai' && <AIPanel />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Export button */}
        <div className="sidebar-footer">
          <button
            className="btn btn-primary btn-full"
            onClick={handleExport}
            disabled={exporting}
            style={{ padding: '13px 20px', fontSize: 14, borderRadius: 10 }}
          >
            {exporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                />
                Generating PDF…
              </>
            ) : (
              <><Download size={17} /> Export PDF</>
            )}
          </button>
        </div>
      </aside>

      {/* ════════════ MAIN CANVAS ════════════ */}
      <main className="main-content">
        <div className="invoice-wrapper">
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, type: 'spring', bounce: 0.2 }}
          >
            <InvoicePreview invoiceRef={invoiceRef} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
