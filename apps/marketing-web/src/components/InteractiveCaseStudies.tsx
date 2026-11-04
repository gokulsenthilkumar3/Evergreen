import { useState } from 'react';

interface Props {
  onStartPoc: () => void;
  lang?: 'en' | 'ta';
}

interface CaseStudyItem {
  id: string;
  company: string;
  location: string;
  category: 'Ring Spinning' | 'OE Rotor' | 'Composite Mill' | 'Yarn Trading';
  spindles: string;
  keyMetric: string;
  metricLabel: string;
  quote: string;
  person: string;
  role: string;
  color: 'emerald' | 'sky' | 'purple' | 'amber';
  beforeAfter: {
    label: string;
    before: string;
    after: string;
  }[];
}

const EXTENDED_CASE_STUDIES: CaseStudyItem[] = [
  {
    id: 'sri_murugan',
    company: 'Illustrative ring-spinning workflow',
    location: 'Tirupur Cluster, Tamil Nadu',
    category: 'Ring Spinning',
    spindles: '18,000 Spindles (30s & 40s Combed Hosiery)',
    keyMetric: 'Pilot required',
    metricLabel: 'Physical indicator capture',
    quote: 'Record received weight, measured moisture and the allowance agreed in your purchase contract. Validate a supported indicator and device identity during a supervised pilot.',
    person: 'Example workflow',
    role: 'No customer testimonial or measured savings',
    color: 'emerald',
    beforeAfter: [
      { label: 'Moisture Calculation', before: 'Separate contract calculation', after: 'Recorded contract inputs and deduction' },
      { label: 'Weighbridge Entry', before: 'Manual Ledger Slip', after: 'Entry workflow; serial capture requires pilot' },
      { label: 'Bale Lot QR Trace', before: 'Chalk marks on bales', after: 'Thermal QR sticker (Bale → Cone)' },
    ],
  },
  {
    id: 'kavitha_cotton',
    company: 'Illustrative accounting workflow',
    location: 'Coimbatore Hub, Tamil Nadu',
    category: 'OE Rotor',
    spindles: '24,000 Spindles + 4 Rotor Frames',
    keyMetric: 'XML export',
    metricLabel: 'Operator-reviewed import',
    quote: 'Export vouchers as XML and let the accountant review and import them into Tally. Verify tax values and reconcile the import result before accepting the posting.',
    person: 'Example workflow',
    role: 'Import timing and outcomes require validation',
    color: 'sky',
    beforeAfter: [
      { label: 'Tally Voucher Entry', before: 'Manual transcription', after: 'XML export for operator import' },
      { label: 'Tax Review', before: 'Separate calculation', after: 'Calculated split for accountant review' },
      { label: 'Audit Preparation', before: 'Separate register lookup', after: 'Cross-register search' },
    ],
  },
  {
    id: 'selvam_spinning',
    company: 'Illustrative collections workflow',
    location: 'Erode District, Tamil Nadu',
    category: 'Composite Mill',
    spindles: '42,000 Spindles + 120 Airjet Looms',
    keyMetric: 'Staff review',
    metricLabel: 'Payment verification',
    quote: 'Prepare bilingual reminder links for staff to send, then verify remittances and record payments in the accounts workflow. A WhatsApp reply does not automatically confirm a bank receipt.',
    person: 'Example workflow',
    role: 'No measured collection improvement',
    color: 'purple',
    beforeAfter: [
      { label: 'Payment Follow-up', before: 'Separate reminder drafting', after: 'Prepared Tamil and English links' },
      { label: 'UTR Bank Reconciliation', before: 'Bank statement matching', after: 'Staff verification before payment entry' },
      { label: 'Buyer Payment Review', before: 'Separate records', after: 'Invoice and payment history' },
    ],
  },
  {
    id: 'shree_venkateshwara',
    company: 'Illustrative yarn-trading workflow',
    location: 'Karur Corridor, Tamil Nadu',
    category: 'Yarn Trading',
    spindles: 'Cotton Brokerage & 25,000 kg/day Distribution',
    keyMetric: 'Traceability',
    metricLabel: 'Recorded dispatch history',
    quote: 'Record agreed tare values and dispatch quantities against the order, retain the gate pass and reconcile the invoice. Calibration and delivery acceptance remain part of the mill operating procedure.',
    person: 'Example workflow',
    role: 'No guaranteed dispute reduction',
    color: 'amber',
    beforeAfter: [
      { label: 'Gate Pass Verification', before: 'Carbon Copy Hand Receipt', after: 'QR-Coded Digitally Sealed E-Pass' },
      { label: 'Tare Review', before: 'Separate tare notes', after: 'Recorded operator-supplied tare' },
      { label: 'e-Way Bill Registration', before: 'External portal process', after: 'Readiness checks; external registration required' },
    ],
  },
];

export function InteractiveCaseStudies({ onStartPoc, lang = 'en' }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeView, setActiveView] = useState<Record<string, 'QUOTE' | 'BEFORE_AFTER'>>({});

  const categories = ['All', 'Ring Spinning', 'OE Rotor', 'Composite Mill', 'Yarn Trading'];

  const filtered = EXTENDED_CASE_STUDIES.filter(
    cs => activeCategory === 'All' || cs.category === activeCategory
  );

  const toggleView = (id: string, view: 'QUOTE' | 'BEFORE_AFTER') => {
    setActiveView(prev => ({ ...prev, [id]: view }));
  };

  return (
    <div className="extended-case-studies">
      <p className="product-readiness-note">{lang === 'ta' ? 'இவை விளக்கத்திற்கான கற்பனைச் செயல்முறைகள். வாடிக்கையாளர் சான்றுகள் அல்லது அளவிடப்பட்ட முடிவுகள் அல்ல.' : 'Illustrative workflows with fictional operating profiles. These are not customer testimonials or measured results.'}</p>
      <div className="cs-category-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={`cs-filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat} {cat === 'All' ? `(${EXTENDED_CASE_STUDIES.length})` : ''}
          </button>
        ))}
      </div>

      <div className="cs-cards-grid">
        {filtered.map(cs => {
          const currentView = activeView[cs.id] || 'QUOTE';
          return (
            <div key={cs.id} className={`cs-card-extended glass-card border-${cs.color}`}>
              <div className="cs-ext-header">
                <div>
                  <div className="cs-ext-company">{cs.company}</div>
                  <div className="cs-ext-location">📍 {cs.location}</div>
                  <div className="cs-ext-spindles">{cs.spindles}</div>
                </div>
                <div className={`cs-ext-metric-box metric-${cs.color}`}>
                  <div className="cs-ext-val">{cs.keyMetric}</div>
                  <div className="cs-ext-lbl">{cs.metricLabel}</div>
                </div>
              </div>

              <div className="cs-view-toggle">
                <button
                  className={`cs-toggle-btn ${currentView === 'QUOTE' ? 'active' : ''}`}
                  onClick={() => toggleView(cs.id, 'QUOTE')}
                >
                  {lang === 'ta' ? '💬 செய்முறை விளக்கம்' : '💬 Workflow example'}
                </button>
                <button
                  className={`cs-toggle-btn ${currentView === 'BEFORE_AFTER' ? 'active' : ''}`}
                  onClick={() => toggleView(cs.id, 'BEFORE_AFTER')}
                >
                  {lang === 'ta' ? '📊 செய்முறை ஒப்பீடு' : '📊 Workflow comparison'}
                </button>
              </div>

              {currentView === 'QUOTE' ? (
                <div className="cs-quote-block">
                  <blockquote className="cs-ext-quote">{cs.quote}</blockquote>
                  <div className="cs-ext-person">
                    <strong>{cs.person}</strong>
                    <span>{cs.role}</span>
                  </div>
                </div>
              ) : (
                <div className="cs-before-after-block">
                  <div className="ba-table">
                    {cs.beforeAfter.map((ba, idx) => (
                      <div key={idx} className="ba-row">
                        <div className="ba-label">{ba.label}</div>
                        <div className="ba-values">
                          <div className="ba-before">
                            <span className="ba-tag tag-before">{lang === 'ta' ? 'முன்பு' : 'Before'}</span>
                            <span>{ba.before}</span>
                          </div>
                          <div className="ba-after">
                            <span className="ba-tag tag-after">{lang === 'ta' ? 'முன்மொழியப்பட்ட செய்முறை' : 'Proposed workflow'}</span>
                            <strong>{ba.after}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="cs-card-footer">
                <span className="cs-cluster-pill">{lang === 'ta' ? 'விளக்க உதாரணம்' : 'Illustrative example'}</span>
                <button className="cs-poc-btn" onClick={onStartPoc}>
                  {lang === 'ta' ? 'உங்கள் ஆலைக்கான POC துவங்குங்கள் →' : 'Plan a pilot →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
