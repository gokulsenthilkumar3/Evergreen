import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartPoc: () => void;
  lang?: 'en' | 'ta';
}

interface TourStep {
  title: string;
  tag: string;
  icon: string;
  color: string;
  desc: string;
  highlights: string[];
  mockupContent: {
    label: string;
    metrics: { name: string; val: string }[];
    footer: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'TareZero Weighbridge & Raw Cotton Inward',
    tag: 'STEP 1 OF 5',
    icon: '⚖️',
    color: 'amber',
    desc: 'The truck rolls onto the weighbridge. EverGreen captures gross & tare weight directly from Avery or Essae serial ports at the hardware level, enforces SIMA 8.5% moisture allowance standards, and prints a tamper-proof QR lot slip.',
    highlights: [
      'RS-232 serial lock prevents manual weight manipulation by drivers or clerks',
      'Instant water weight deduction saved an average of ₹4.2 Lakhs/year per mill',
      'QR code printed on thermal sticker follows the cotton lot all the way to cone packing',
    ],
    mockupContent: {
      label: 'WEIGHBRIDGE INWARD · LOT #TN-9402',
      metrics: [
        { name: 'Gross Weight', val: '34,280 kg' },
        { name: 'Tare Weight', val: '14,200 kg' },
        { name: 'Observed Moisture', val: '9.8% (+1.3% excess)' },
        { name: 'Water Deducted', val: '-261 kg (₹45,675 saved)' },
      ],
      footer: '🔒 Cryptographically signed SHA-256 voucher locked before Tally export',
    },
  },
  {
    title: 'Spindle Telemetry & Machine OEE',
    tag: 'STEP 2 OF 5',
    icon: '⚙️',
    color: 'emerald',
    desc: 'Monitor all Ring Frames, Draw Frames, and Carding engines from your phone or office desktop. Get live RPM, end breakage rates, shift production variance, and automatic WhatsApp alerts when any frame dips below efficiency targets.',
    highlights: [
      'Live spindle speed gauges (e.g. 19,400 RPM on 40s Combed)',
      'OEE tracking by shift (A/B/C) with operator accountability',
      'Pneumafil waste % tracked in real time to prevent cotton fiber loss',
    ],
    mockupContent: {
      label: 'RING FRAME TELEMETRY · 18,400 SPINDLES ACTIVE',
      metrics: [
        { name: 'Average Spindle RPM', val: '19,450 RPM' },
        { name: 'Factory OEE', val: '94.2%' },
        { name: 'Current Shift Yield', val: '4,821.4 kg' },
        { name: 'Average CSP Lea', val: '2,850 CSP' },
      ],
      footer: '📱 WhatsApp alert dispatched to Spinning Master on abnormal end-breakage',
    },
  },
  {
    title: 'Book-Ellam (புக் எல்லாம்) Unified Audit Engine',
    tag: 'STEP 3 OF 5',
    icon: '📖',
    color: 'purple',
    desc: 'The traditional South Indian textile trade’s ultimate audit research tool. Search across Day Book, Cotton Inward, Yarn Outward, and Party Khata simultaneously with natural language. Eliminates days of flipping paper ledgers.',
    highlights: [
      'One search box searches across all physical mill registers simultaneously',
      'Lot QR lookup traces from raw bale truck inward to buyer cone box delivery',
      'Instant party reconciliation showing pending balance, UTRs, and dispatch E-Way bills',
    ],
    mockupContent: {
      label: 'BOOK-ELLAM CROSS-REGISTER AUDIT SEARCH',
      metrics: [
        { name: 'Search Query', val: '"Lot 9402 Tirupur"' },
        { name: 'Registers Scanned', val: '4 Ledgers in 0.18s' },
        { name: 'Cotton Inward', val: '100 Bales (Shankar-6)' },
        { name: 'Dispatched Gate Pass', val: 'GP-1184 (1,200 Cones)' },
      ],
      footer: '✓ Complete audit history from raw cotton inward to customer bank payment',
    },
  },
  {
    title: 'Tally Prime XML & Interstate GST Automation',
    tag: 'STEP 4 OF 5',
    icon: '📑',
    color: 'sky',
    desc: 'Your accountant never has to re-type another invoice or inward note. EverGreen auto-generates 100% valid Tally Prime XML vouchers with automated CGST, SGST, and IGST tax splits and E-Way Bill IRN QR integration.',
    highlights: [
      '1-click export of purchase, sales, and payment receipt vouchers',
      'Zero manual data entry errors — Tally import takes 12 seconds instead of 4 hours',
      'Automatic Interstate IGST split for yarn dispatches to Surat, Panipat, or exports',
    ],
    mockupContent: {
      label: 'TALLY PRIME XML BRIDGE & GSTN DISPATCH',
      metrics: [
        { name: 'Voucher Type', val: 'Sales & Dispatch Invoice' },
        { name: 'Tax Categorization', val: 'CGST 2.5% + SGST 2.5%' },
        { name: 'E-Way Bill Status', val: 'IRN #181092819201 Active' },
        { name: 'Tally Import Time', val: '12 Seconds (0 Duplicates)' },
      ],
      footer: '💼 Your accountant continues using Tally Prime with zero workflow disruption',
    },
  },
  {
    title: '30-Day Active Grace Quota & Multi-Cloud Deploy',
    tag: 'STEP 5 OF 5',
    icon: '🛡️',
    color: 'amber',
    desc: 'Spinning mills run 24/7/365. EverGreen guarantees your factory operations NEVER stop on license expiry. Enjoy 30 full days of active grace protection, and 1-to-3 minute instant reactivation as soon as your bank UTR is confirmed.',
    highlights: [
      '100% isolated relational database per mill tenant — zero multi-tenant data sharing',
      'Deploy on local Ubuntu VM, GCP Cloud Run, AWS ECS, or Azure Container Apps in 1 command',
      'Active grace policy guarantees factory weighbridge and dispatches keep running',
    ],
    mockupContent: {
      label: 'ENTERPRISE LICENSING & ZERO-LOCKOUT GUARANTEE',
      metrics: [
        { name: 'Grace Quota', val: '30 Full Days Active' },
        { name: 'Weighbridge Status', val: '100% Operational' },
        { name: 'Reactivation SLA', val: '< 3 Minutes on UTR' },
        { name: 'Deployment Target', val: 'Local VM / GCP / AWS / Azure' },
      ],
      footer: '⚡ 1-command installer sets up entire mill stack in under 8 minutes',
    },
  },
];

export function ProductTourModal({ isOpen, onClose, onStartPoc }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="tour-modal-box glass-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="tour-modal-header">
          <div className="tour-progress-pills">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={idx}
                className={`tour-pill-btn ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
                onClick={() => setCurrentStepIndex(idx)}
              >
                <span>{step.icon}</span>
                <span>{step.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tour-modal-body">
          <div className="tour-info-side">
            <div className="tour-step-badge-row">
              <span className={`tour-step-tag tag-${currentStep.color}`}>{currentStep.tag}</span>
              <span className="tour-step-counter">{currentStepIndex + 1} / {TOUR_STEPS.length}</span>
            </div>

            <h3 className="tour-step-title">{currentStep.icon} {currentStep.title}</h3>
            <p className="tour-step-desc">{currentStep.desc}</p>

            <div className="tour-highlights-box">
              <span className="tour-highlights-label">Key Mill Benefits:</span>
              <ul className="tour-highlights-list">
                {currentStep.highlights.map((h, i) => (
                  <li key={i}>
                    <span className={`tour-dot dot-${currentStep.color}`} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="tour-mockup-side">
            <div className="tour-mockup-card">
              <div className="tour-mockup-top">
                <span className="tour-mockup-dot" />
                <span className="tour-mockup-label">{currentStep.mockupContent.label}</span>
              </div>

              <div className="tour-mockup-metrics">
                {currentStep.mockupContent.metrics.map((m, i) => (
                  <div key={i} className="mockup-metric-item">
                    <span className="mm-name">{m.name}</span>
                    <strong className="mm-val">{m.val}</strong>
                  </div>
                ))}
              </div>

              <div className="tour-mockup-footer">
                <span>{currentStep.mockupContent.footer}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tour-modal-footer">
          <div className="tour-nav-btns">
            <button
              className="btn-ghost btn-sm"
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
            >
              ← Previous
            </button>
            {currentStepIndex < TOUR_STEPS.length - 1 ? (
              <button
                className="btn-primary btn-sm"
                onClick={() => setCurrentStepIndex(prev => Math.min(TOUR_STEPS.length - 1, prev + 1))}
              >
                Next Step →
              </button>
            ) : (
              <button
                className="btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onStartPoc();
                }}
              >
                🚀 Start Free 30-Day POC
              </button>
            )}
          </div>

          <div className="tour-poc-link">
            <button
              className="link-btn"
              onClick={() => {
                onClose();
                onStartPoc();
              }}
            >
              Ready to install at your mill? Start Free 30-Day Trial →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
