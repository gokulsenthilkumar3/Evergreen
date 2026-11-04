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
    desc: 'Record gross and tare weights, measured moisture and the allowance agreed in your purchase contract. Indicator parsing and slip-signing utilities are available; physical serial capture and device provisioning require a supported-hardware pilot.',
    highlights: [
      'Validate the indicator connection and provision device identity during the pilot',
      'Review moisture deductions against the purchase contract',
      'QR code printed on thermal sticker follows the cotton lot all the way to cone packing',
    ],
    mockupContent: {
      label: 'WEIGHBRIDGE INWARD · LOT #TN-9402',
      metrics: [
        { name: 'Gross Weight', val: '34,280 kg' },
        { name: 'Tare Weight', val: '14,200 kg' },
        { name: 'Observed Moisture', val: '9.8% (+1.3% excess)' },
        { name: 'Illustrative deduction', val: '261 kg; confirm contract inputs' },
      ],
      footer: 'Illustrative receipt values; no physical indicator is connected to this tour',
    },
  },
  {
    title: 'Machine Records & Shift Production',
    tag: 'STEP 2 OF 5',
    icon: '⚙️',
    color: 'emerald',
    desc: 'Review recorded machine and shift-production data. The sample gauges below illustrate a possible dashboard; live PLC telemetry and automatic machine alerts require a separately validated integration.',
    highlights: [
      'Maintain machine records and operator-entered production figures',
      'Compare recorded shifts and production variance',
      'Review recorded waste against the production balance',
    ],
    mockupContent: {
      label: 'ILLUSTRATIVE MACHINE DASHBOARD · SAMPLE VALUES',
      metrics: [
        { name: 'Average Spindle RPM', val: '19,450 RPM' },
        { name: 'Factory OEE', val: '94.2%' },
        { name: 'Current Shift Yield', val: '4,821.4 kg' },
        { name: 'Average CSP Lea', val: '2,850 CSP' },
      ],
      footer: 'Sample values only; no machine feed or alert was sent',
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
        { name: 'Registers', val: 'Illustrative cross-register lookup' },
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
    desc: 'Export purchase, sales and receipt vouchers as Tally XML. An accountant reviews and imports the file, then reconciles the result. e-Way Bill readiness checks do not register a bill or obtain an IRN.',
    highlights: [
      '1-click export of purchase, sales, and payment receipt vouchers',
      'Review import acknowledgements and reconcile values in Tally',
      'Automatic Interstate IGST split for yarn dispatches to Surat, Panipat, or exports',
    ],
    mockupContent: {
      label: 'TALLY PRIME XML BRIDGE & GSTN DISPATCH',
      metrics: [
        { name: 'Voucher Type', val: 'Sales & Dispatch Invoice' },
        { name: 'Tax Categorization', val: 'CGST 2.5% + SGST 2.5%' },
        { name: 'e-Way Bill Status', val: 'External registration required' },
        { name: 'Tally Import', val: 'Operator review required' },
      ],
      footer: 'XML export is available; two-way posting is not implemented',
    },
  },
  {
    title: 'Installation & Licence Setup',
    tag: 'STEP 5 OF 5',
    icon: '🛡️',
    color: 'amber',
    desc: 'Choose a customer-specific local or hosted installation and agree activation terms with the owner. Signed offline deadlines limit local access; renew before expiry and verify backups and recovery for your chosen deployment.',
    highlights: [
      'Separate installation and database per customer',
      'Local Linux and container deployment helpers need host-specific configuration',
      'Licence activation, offline validity and renewals follow signed owner terms',
    ],
    mockupContent: {
      label: 'ILLUSTRATIVE INSTALLATION CHECKLIST',
      metrics: [
        { name: 'Offline Validity', val: 'Signed owner deadline' },
        { name: 'Hardware Acceptance', val: 'Supported-device pilot required' },
        { name: 'Renewal', val: 'Owner-assisted activation' },
        { name: 'Deployment Target', val: 'Configured local or container host' },
      ],
      footer: 'Validate setup, backup and recovery before operational use',
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
            <p className="product-readiness-note">Illustrative product tour. Sample figures are not measured customer outcomes.</p>
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
