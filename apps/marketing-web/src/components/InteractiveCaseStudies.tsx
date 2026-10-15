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
    company: 'Sri Murugan Handlooms & Spinning Mills',
    location: 'Tirupur Cluster, Tamil Nadu',
    category: 'Ring Spinning',
    spindles: '18,000 Spindles (30s & 40s Combed Hosiery)',
    keyMetric: '₹4.2L / yr',
    metricLabel: 'Moisture Fraud Intercepted',
    quote: '"Before EverGreen, we were losing ₹35 to ₹45 on every cotton bale due to water injection by unmonitored ginners. The RS-232 serial lock and SIMA 8.5% deduction caught ₹18.4 Lakhs in our first full year."',
    person: 'M. Selvakumar',
    role: 'Managing Director',
    color: 'emerald',
    beforeAfter: [
      { label: 'Moisture Fraud Loss', before: 'Lost ₹38 / bale', after: '₹0 / bale (100% Intercepted)' },
      { label: 'Weighbridge Entry', before: 'Manual Ledger Slip', after: 'Automatic RS-232 Hardware Tare Lock' },
      { label: 'Bale Lot QR Trace', before: 'Chalk marks on bales', after: 'Thermal QR sticker (Bale → Cone)' },
    ],
  },
  {
    id: 'kavitha_cotton',
    company: 'Kavitha Cotton Mills Pvt Ltd',
    location: 'Coimbatore Hub, Tamil Nadu',
    category: 'OE Rotor',
    spindles: '24,000 Spindles + 4 Rotor Frames',
    keyMetric: '18 Hours',
    metricLabel: 'Audit Time Saved Per Month',
    quote: '"Our accounts department used to spend 4 hours every evening typing dispatch gate passes into Tally. EverGreen auto-generates the complete Tally Prime XML file. One click import, zero tax errors, zero duplicate vouchers."',
    person: 'K. Priya, ACA',
    role: 'Chief Financial Officer',
    color: 'sky',
    beforeAfter: [
      { label: 'Tally Voucher Entry', before: '4 Hours / Day manual typing', after: '12 Seconds 1-Click XML Import' },
      { label: 'GST Tax Errors', before: '3–5 reconciliation errors/mo', after: '0% Tax Discrepancy (Auto-Split)' },
      { label: 'Month-End Audit Prep', before: '4 Full Days of Paper Search', after: '15 Minutes on Book-Ellam' },
    ],
  },
  {
    id: 'selvam_spinning',
    company: 'Selvam Spinning Works & Export Unit',
    location: 'Erode District, Tamil Nadu',
    category: 'Composite Mill',
    spindles: '42,000 Spindles + 120 Airjet Looms',
    keyMetric: '12 Days',
    metricLabel: 'DSO Reduction via WhatsApp',
    quote: '"The automated bilingual WhatsApp payment reminders in Tamil & English are brilliant. Buyers reply with bank UTR screenshots directly on WhatsApp, and our ledger auto-updates. Outstanding collections improved by 28% in month one."',
    person: 'S. Rajan',
    role: 'Founder & Chairman',
    color: 'purple',
    beforeAfter: [
      { label: 'Payment Collection Cycle', before: '48 Days Average DSO', after: '36 Days (Reduced by 12 Days)' },
      { label: 'UTR Bank Reconciliation', before: '2 Days bank statement matching', after: 'Instant Automated Webhook Sync' },
      { label: 'Buyer Payment Disputes', before: '14 disputes/quarter', after: '0 disputes (Digitally Signed Slips)' },
    ],
  },
  {
    id: 'shree_venkateshwara',
    company: 'Shree Venkateshwara Yarn Traders',
    location: 'Karur Corridor, Tamil Nadu',
    category: 'Yarn Trading',
    spindles: 'Cotton Brokerage & 25,000 kg/day Distribution',
    keyMetric: '100%',
    metricLabel: 'Dispute-Free Cone Dispatches',
    quote: '"Trading yarn between Coimbatore spinners and Karur home-textile weavers used to involve constant weight complaints. EverGreen’s 2.5 kg calibrated tare deduction and gate pass QR code ended weight disputes permanently."',
    person: 'P. Anandhan',
    role: 'Managing Partner',
    color: 'amber',
    beforeAfter: [
      { label: 'Gate Pass Verification', before: 'Carbon Copy Hand Receipt', after: 'QR-Coded Digitally Sealed E-Pass' },
      { label: 'Tare Weight Disputes', before: 'Frequent 20-30 kg box claims', after: 'Zero Tare Variance (Calibrated 2.5kg)' },
      { label: 'E-Way Bill Generation', before: '15 Mins on GSTN portal', after: '1-Click API Automated Creation' },
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
                  {lang === 'ta' ? '💬 ஆலை கருத்துரை' : '💬 Mill Testimonial'}
                </button>
                <button
                  className={`cs-toggle-btn ${currentView === 'BEFORE_AFTER' ? 'active' : ''}`}
                  onClick={() => toggleView(cs.id, 'BEFORE_AFTER')}
                >
                  {lang === 'ta' ? '📊 முன் & பின் ஒப்பீடு' : '📊 Before vs After'}
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
                            <span className="ba-tag tag-after">{lang === 'ta' ? 'EverGreen உடன்' : 'With EverGreen'}</span>
                            <strong>{ba.after}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="cs-card-footer">
                <span className="cs-cluster-pill">{lang === 'ta' ? 'உறுதிப்படுத்தப்பட்ட தரவு' : 'Verified Mill Telemetry'}</span>
                <button className="cs-poc-btn" onClick={onStartPoc}>
                  {lang === 'ta' ? 'உங்கள் ஆலைக்கான POC துவங்குங்கள் →' : 'Achieve Similar ROI →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
