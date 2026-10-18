import { useState, useEffect } from 'react';

interface Props {
  onStartPoc: () => void;
  lang?: 'en' | 'ta';
}

export function InteractiveFactorySimulator({ onStartPoc, lang = 'en' }: Props) {
  const [activeTab, setActiveTab] = useState<'WEIGHBRIDGE' | 'BOOK_ELLAM' | 'SPINDLE' | 'GRACE'>('WEIGHBRIDGE');

  // Weighbridge Simulation State
  const [grossWeight, setGrossWeight] = useState(34280);
  const [tareWeight, setTareWeight] = useState(14200);
  const [moisturePct, setMoisturePct] = useState(9.8);
  const [showQrSlip, setShowQrSlip] = useState(false);
  const [indicatorModel, setIndicatorModel] = useState('Avery E1105');

  // SIMA Standard 8.5%
  const simaStandard = 8.5;
  const netWeight = Math.max(0, grossWeight - tareWeight);
  const excessMoisturePct = Math.max(0, moisturePct - simaStandard);
  const moistureDeductionKg = Math.round(netWeight * (excessMoisturePct / 100));
  const billableWeightKg = netWeight - moistureDeductionKg;
  const cottonPricePerKg = 175; // Approx ₹62,000 / candy (355 kg)
  const moneySaved = Math.round(moistureDeductionKg * cottonPricePerKg);
  const sampleLotNo = 'LOT-TN-2026-9402';
  const sampleHash = `sha256:${(grossWeight * 71 + tareWeight * 13 + Math.round(moisturePct * 100)).toString(16).padEnd(16, 'a')}...`;

  // Book-Ellam Search State
  const [searchQuery, setSearchQuery] = useState('Lot 9402');
  const samplePresets = ['Lot 9402', 'Sri Murugan 40s', 'Moisture > 9%', 'E-Way Bill'];

  // Spindle Telemetry State
  const [activeSpindles] = useState(18400);
  const [simulatedAnomaly, setSimulatedAnomaly] = useState(false);
  const rpmSpeed = simulatedAnomaly ? 18910 : 19450;
  const [shiftKgSpun, setShiftKgSpun] = useState(4821.4);

  // Live ticking of production counter
  useEffect(() => {
    const timer = setInterval(() => {
      setShiftKgSpun(prev => +(prev + 0.15).toFixed(1));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Grace & Reactivation State
  const [utrInput, setUtrInput] = useState('SBI20261015-88201');
  const [reactivationStep, setReactivationStep] = useState<number>(0); // 0: Idle, 1: Verifying, 2: Key Signed, 3: Active
  const [graceReactivated, setGraceReactivated] = useState(false);

  const triggerReactivation = () => {
    if (!utrInput.trim()) return;
    setReactivationStep(1);
    setGraceReactivated(false);
    setTimeout(() => {
      setReactivationStep(2);
      setTimeout(() => {
        setReactivationStep(3);
        setGraceReactivated(true);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="sim-wrapper glass-card">
      <div className="sim-header">
        <div className="sim-title-group">
          <div className="sim-badge">
            <span className="sim-pulse-dot" />
            {lang === 'ta' ? 'நேரடி ஆலை கட்டுப்பாட்டு மையம்' : 'LIVE OPERATIONAL DIGITAL TWIN'}
          </div>
          <h3>{lang === 'ta' ? 'EverGreen OS நேரடி செயல்பாட்டு மாதிரி' : 'Interactive Factory Floor Simulator'}</h3>
          <p>{lang === 'ta' ? 'கீழே உள்ள தாவல்களை கிளிக் செய்து ஒவ்வொரு மாட்யூலையும் நேரடியாக இயக்கிப் பாருங்கள்.' : 'Switch between modules below to experience live weighbridge telemetry, cross-ledger audit search, spindle speed monitoring, and instant grace reactivation.'}</p>
        </div>

        <div className="sim-tabs">
          <button
            className={`sim-tab ${activeTab === 'WEIGHBRIDGE' ? 'active' : ''}`}
            onClick={() => setActiveTab('WEIGHBRIDGE')}
          >
            <span>⚖️</span>
            <span>{lang === 'ta' ? 'எடைமேடை & ஈரம்' : 'TareZero Weighbridge'}</span>
          </button>
          <button
            className={`sim-tab ${activeTab === 'BOOK_ELLAM' ? 'active' : ''}`}
            onClick={() => setActiveTab('BOOK_ELLAM')}
          >
            <span>📖</span>
            <span>{lang === 'ta' ? 'புக் எல்லாம்' : 'Book-Ellam (புக் எல்லாம்)'}</span>
          </button>
          <button
            className={`sim-tab ${activeTab === 'SPINDLE' ? 'active' : ''}`}
            onClick={() => setActiveTab('SPINDLE')}
          >
            <span>⚙️</span>
            <span>{lang === 'ta' ? 'கதிர் வேகம் & OEE' : 'Spindle Telemetry'}</span>
          </button>
          <button
            className={`sim-tab ${activeTab === 'GRACE' ? 'active' : ''}`}
            onClick={() => setActiveTab('GRACE')}
          >
            <span>🛡️</span>
            <span>{lang === 'ta' ? '30-நாள் சலுகை & மீட்பு' : '30-Day Grace & UTR'}</span>
          </button>
        </div>
      </div>

      <div className="sim-body">
        {/* ─── TAB 1: WEIGHBRIDGE TAREZERO ─── */}
        {activeTab === 'WEIGHBRIDGE' && (
          <div className="sim-content-grid">
            <div className="sim-controls-panel">
              <div className="sim-panel-title">
                <span>🎛️ Live Scale Controls</span>
                <span className="sim-chip">RS-232 9600-8-N-1</span>
              </div>

              <div className="sim-input-row">
                <label>Indicator Hardware Model</label>
                <select
                  value={indicatorModel}
                  onChange={e => setIndicatorModel(e.target.value)}
                  className="sim-select"
                >
                  <option value="Avery E1105">Avery Weigh-Tronix E1105</option>
                  <option value="Avery E1205">Avery Weigh-Tronix E1205</option>
                  <option value="Essae 501">Essae 501 Truck Scale</option>
                  <option value="Mettler IND570">Mettler-Toledo IND570</option>
                  <option value="Contech CW">Contech CW Industrial Scale</option>
                </select>
              </div>

              <div className="sim-slider-group">
                <div className="sim-slider-header">
                  <span>Gross Weight (Truck + 100 Bales)</span>
                  <strong>{grossWeight.toLocaleString()} kg</strong>
                </div>
                <input
                  type="range"
                  min="28000"
                  max="42000"
                  step="50"
                  value={grossWeight}
                  onChange={e => setGrossWeight(Number(e.target.value))}
                  className="sim-range"
                />
              </div>

              <div className="sim-slider-group">
                <div className="sim-slider-header">
                  <span>Tare Weight (Empty Lorry)</span>
                  <strong>{tareWeight.toLocaleString()} kg</strong>
                </div>
                <input
                  type="range"
                  min="11000"
                  max="16000"
                  step="50"
                  value={tareWeight}
                  onChange={e => setTareWeight(Number(e.target.value))}
                  className="sim-range"
                />
              </div>

              <div className="sim-slider-group sim-slider-highlight">
                <div className="sim-slider-header">
                  <span>Cotton Moisture Meter Reading</span>
                  <strong style={{ color: moisturePct > simaStandard ? 'var(--rose)' : 'var(--emerald)' }}>
                    {moisturePct.toFixed(1)}% {moisturePct > simaStandard ? `(+${excessMoisturePct.toFixed(1)}% excess water)` : '(Normal)'}
                  </strong>
                </div>
                <input
                  type="range"
                  min="7.0"
                  max="13.0"
                  step="0.1"
                  value={moisturePct}
                  onChange={e => setMoisturePct(Number(e.target.value))}
                  className="sim-range"
                />
                <div className="sim-slider-hint">
                  <span>SIMA / CCI Standard: 8.5% moisture allowance</span>
                </div>
              </div>

              <div className="sim-btn-group">
                <button
                  className="btn-primary btn-sm"
                  onClick={() => setShowQrSlip(!showQrSlip)}
                >
                  {showQrSlip ? 'Hide QR Inward Slip' : '🏷️ Generate Bale Lot QR Slip'}
                </button>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    setGrossWeight(35420);
                    setTareWeight(14180);
                    setMoisturePct(10.6);
                  }}
                >
                  Simulate Fraud Batch (+2.1%)
                </button>
              </div>
            </div>

            <div className="sim-display-panel">
              <div className="indicator-screen">
                <div className="indicator-topbar">
                  <span>EVERGREEN TAREZERO GATEWAY · PORT: COM3</span>
                  <span className="live-status-dot">● STREAM ACTIVE</span>
                </div>
                <div className="indicator-value-box">
                  <div className="indicator-sub">STABLE NET WEIGHT</div>
                  <div className="indicator-digits">{netWeight.toLocaleString()} <span className="kg">KG</span></div>
                  <div className="indicator-meta">
                    <span>GROSS: {grossWeight.toLocaleString()} KG</span>
                    <span>TARE: {tareWeight.toLocaleString()} KG</span>
                    <span>100 BALES (~{Math.round(netWeight / 100)} KG/BALE)</span>
                  </div>
                </div>

                <div className="indicator-stream">
                  <code>{indicatorModel} &gt;&gt; ST,GS,+0{grossWeight}kg,TR,+0{tareWeight}kg,NT,+0{netWeight}kg [STABLE_LOCKED]</code>
                </div>
              </div>

              <div className="sim-audit-card">
                <div className="sim-audit-header">
                  <span>⚖️ SIMA / CCI Moisture Deduction Audit</span>
                  <span className="sim-cryptoseal">🔒 {sampleHash.slice(0, 20)}</span>
                </div>
                <div className="sim-audit-metrics">
                  <div className="sim-metric">
                    <span>Observed Moisture</span>
                    <strong>{moisturePct.toFixed(1)}%</strong>
                  </div>
                  <div className="sim-metric">
                    <span>Moisture Deduction</span>
                    <strong style={{ color: 'var(--amber)' }}>-{moistureDeductionKg.toLocaleString()} kg</strong>
                  </div>
                  <div className="sim-metric">
                    <span>Final Billable Weight</span>
                    <strong style={{ color: 'var(--emerald)' }}>{billableWeightKg.toLocaleString()} kg</strong>
                  </div>
                  <div className="sim-metric highlight-metric">
                    <span>Money Saved on Lot</span>
                    <strong style={{ color: 'var(--emerald)' }}>₹{moneySaved.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="sim-audit-note">
                  {moistureDeductionKg > 0 ? (
                    <span>🚨 <strong>Fraud Intercepted:</strong> The broker billed for water weight. EverGreen automatically deducted {moistureDeductionKg} kg from the purchase voucher before Tally export.</span>
                  ) : (
                    <span>✅ <strong>Lot Passed:</strong> Moisture is within standard {simaStandard}% limit. Full weight credited.</span>
                  )}
                </div>
              </div>

              {showQrSlip && (
                <div className="sim-qr-slip">
                  <div className="qr-slip-header">
                    <div>EVERGREEN TEXTILE ERP · GATE INWARD PASS</div>
                    <small>SRI MURUGAN SPINNING MILLS — UNIT 1</small>
                  </div>
                  <div className="qr-slip-grid">
                    <div className="qr-box">
                      <svg viewBox="0 0 100 100" className="qr-svg">
                        <rect width="100" height="100" fill="#fff" />
                        <rect x="10" y="10" width="25" height="25" fill="#000" />
                        <rect x="15" y="15" width="15" height="15" fill="#fff" />
                        <rect x="65" y="10" width="25" height="25" fill="#000" />
                        <rect x="70" y="15" width="15" height="15" fill="#fff" />
                        <rect x="10" y="65" width="25" height="25" fill="#000" />
                        <rect x="15" y="70" width="15" height="15" fill="#fff" />
                        <rect x="42" y="42" width="16" height="16" fill="#10b981" />
                        <rect x="42" y="15" width="8" height="15" fill="#000" />
                        <rect x="15" y="42" width="15" height="8" fill="#000" />
                        <rect x="65" y="65" width="15" height="8" fill="#000" />
                        <rect x="75" y="42" width="12" height="12" fill="#000" />
                      </svg>
                      <span>SCAN LOT QR</span>
                    </div>
                    <div className="qr-details">
                      <div><strong>Lot No:</strong> {sampleLotNo}</div>
                      <div><strong>Variety:</strong> Shankar-6 Cotton (Gujarat)</div>
                      <div><strong>Net Billed:</strong> {billableWeightKg.toLocaleString()} kg ({100} Bales)</div>
                      <div><strong>Moisture:</strong> {moisturePct.toFixed(1)}% (Deducted {moistureDeductionKg} kg)</div>
                      <div><strong>Cryptographic Hash:</strong> {sampleHash.slice(0, 16)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: BOOK-ELLAM (புக் எல்லாம்) ─── */}
        {activeTab === 'BOOK_ELLAM' && (
          <div className="sim-book-ellam">
            <div className="ellam-search-bar">
              <span className="ellam-search-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search across Day Book, Cotton Inward, Yarn Outward, Party Khata..."
                className="ellam-search-input"
              />
              <span className="ellam-pill">All Books (புக் எல்லாம்)</span>
            </div>

            <div className="ellam-preset-row">
              <span className="ellam-preset-label">Try sample queries:</span>
              {samplePresets.map(preset => (
                <button
                  key={preset}
                  className={`ellam-preset-btn ${searchQuery === preset ? 'active' : ''}`}
                  onClick={() => setSearchQuery(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="ellam-registers-grid">
              {/* Register 1: Cotton Inward */}
              <div className="register-card">
                <div className="register-head reg-cotton">
                  <span>🌿 Cotton Inward Register</span>
                  <span className="reg-count">3 Records</span>
                </div>
                <div className="register-table-scroll">
                  <table className="register-table">
                    <thead>
                      <tr>
                        <th>Lot No</th>
                        <th>Supplier</th>
                        <th>Bales</th>
                        <th>Moisture</th>
                        <th>Billable Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="reg-row-highlight">
                        <td><strong>LOT-TN-9402</strong></td>
                        <td>Shree Balaji Traders</td>
                        <td>100 Bales</td>
                        <td><span className="tag-amber">9.8% (-261kg)</span></td>
                        <td>19,819 kg</td>
                      </tr>
                      <tr>
                        <td>LOT-TN-9401</td>
                        <td>Kaveri Ginning Mills</td>
                        <td>85 Bales</td>
                        <td><span className="tag-green">8.2% (Pass)</span></td>
                        <td>14,450 kg</td>
                      </tr>
                      <tr>
                        <td>LOT-GJ-8812</td>
                        <td>Gujarat Cotton Co-Op</td>
                        <td>120 Bales</td>
                        <td><span className="tag-green">8.4% (Pass)</span></td>
                        <td>20,400 kg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Register 2: Production Day Book */}
              <div className="register-card">
                <div className="register-head reg-prod">
                  <span>🧵 Production Day Book</span>
                  <span className="reg-count">Shift A & B</span>
                </div>
                <div className="register-table-scroll">
                  <table className="register-table">
                    <thead>
                      <tr>
                        <th>Shift</th>
                        <th>Count</th>
                        <th>Ring Frames</th>
                        <th>Kgs Spun</th>
                        <th>Avg CSP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="reg-row-highlight">
                        <td><strong>Shift A (Day)</strong></td>
                        <td>40s Combed Hosiery</td>
                        <td>Frames 01-08</td>
                        <td>4,821 kg</td>
                        <td><span className="tag-green">2,850 CSP</span></td>
                      </tr>
                      <tr>
                        <td>Shift B (Eve)</td>
                        <td>30s Carded Weaving</td>
                        <td>Frames 09-14</td>
                        <td>3,940 kg</td>
                        <td><span className="tag-green">2,420 CSP</span></td>
                      </tr>
                      <tr>
                        <td>Shift C (Night)</td>
                        <td>60s Compact Cotton</td>
                        <td>Frames 15-20</td>
                        <td>2,680 kg</td>
                        <td><span className="tag-green">3,120 CSP</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Register 3: Outward Yarn Gate Pass */}
              <div className="register-card">
                <div className="register-head reg-outward">
                  <span>🚚 Outward Yarn Gate Pass</span>
                  <span className="reg-count">Active Dispatches</span>
                </div>
                <div className="register-table-scroll">
                  <table className="register-table">
                    <thead>
                      <tr>
                        <th>Gate Pass #</th>
                        <th>Buyer (Tirupur/Surat)</th>
                        <th>Cones</th>
                        <th>Net Kgs</th>
                        <th>E-Way Bill</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="reg-row-highlight">
                        <td><strong>GP-2026-1184</strong></td>
                        <td>Sri Murugan Tex Tirupur</td>
                        <td>1,200 Cones</td>
                        <td>3,000 kg</td>
                        <td><span className="tag-sky">#181092819201</span></td>
                      </tr>
                      <tr>
                        <td>GP-2026-1183</td>
                        <td>Kavitha Knits Erode</td>
                        <td>800 Cones</td>
                        <td>2,000 kg</td>
                        <td><span className="tag-sky">#181092819198</span></td>
                      </tr>
                      <tr>
                        <td>GP-2026-1182</td>
                        <td>Royal Weaving Surat</td>
                        <td>2,400 Cones</td>
                        <td>6,000 kg</td>
                        <td><span className="tag-sky">#181092819140</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Register 4: Party Khata */}
              <div className="register-card">
                <div className="register-head reg-khata">
                  <span>💰 Party Khata / Ledger (Tally Bridge)</span>
                  <span className="reg-count">Synchronized</span>
                </div>
                <div className="register-table-scroll">
                  <table className="register-table">
                    <thead>
                      <tr>
                        <th>Party</th>
                        <th>Debit (₹)</th>
                        <th>Credit (₹)</th>
                        <th>UTR Ref</th>
                        <th>Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="reg-row-highlight">
                        <td><strong>Sri Murugan Tex</strong></td>
                        <td>₹8,85,000</td>
                        <td>₹5,00,000</td>
                        <td>HDFCN261011</td>
                        <td><span className="tag-amber">₹3,85,000 (Cr)</span></td>
                      </tr>
                      <tr>
                        <td>Shree Balaji Traders</td>
                        <td>₹0</td>
                        <td>₹34,68,325</td>
                        <td>SBIN202694</td>
                        <td><span className="tag-green">₹0 (Cleared)</span></td>
                      </tr>
                      <tr>
                        <td>Kavitha Knits</td>
                        <td>₹5,90,000</td>
                        <td>₹5,90,000</td>
                        <td>ICIC202611</td>
                        <td><span className="tag-green">₹0 (Settled)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="ellam-footer-note">
              <span>⚡ <strong>All Registers in One Query:</strong> In traditional mills, auditing Lot 9402 requires pulling 4 dusty registers from the shelf. EverGreen unifies inward, spinning yield, dispatch, and payment into a single 0.2-second search view.</span>
            </div>
          </div>
        )}

        {/* ─── TAB 3: SPINDLE TELEMETRY ─── */}
        {activeTab === 'SPINDLE' && (
          <div className="sim-spindle-telemetry">
            <div className="spindle-top-stats">
              <div className="spindle-stat-card">
                <span>Active Spindles</span>
                <strong style={{ color: 'var(--emerald)' }}>{activeSpindles.toLocaleString()} / 18,400</strong>
                <small>100% Floor Utilization</small>
              </div>
              <div className="spindle-stat-card">
                <span>Average Ring Speed</span>
                <strong style={{ color: 'var(--sky)' }}>{rpmSpeed.toLocaleString()} RPM</strong>
                <small>40s Combed Optimized</small>
              </div>
              <div className="spindle-stat-card">
                <span>Shift A Production</span>
                <strong style={{ color: 'var(--amber)' }}>{shiftKgSpun.toFixed(1)} kg</strong>
                <small className="spindle-live-tick">▲ Ticking live (+0.15kg/sec)</small>
              </div>
              <div className="spindle-stat-card">
                <span>Factory OEE</span>
                <strong style={{ color: 'var(--purple)' }}>94.2%</strong>
                <small>Pneumafil Waste: 1.6%</small>
              </div>
            </div>

            <div className="ring-frames-grid">
              {[
                { id: 'RF-01', count: '40s Combed', rpm: 19500, oee: 96, status: 'NORMAL', csp: 2860 },
                { id: 'RF-02', count: '40s Combed', rpm: 19480, oee: 95, status: 'NORMAL', csp: 2845 },
                { id: 'RF-03', count: '40s Combed', rpm: 19520, oee: 94, status: 'NORMAL', csp: 2855 },
                { id: 'RF-04', count: '40s Combed', rpm: simulatedAnomaly ? 16800 : 19410, oee: simulatedAnomaly ? 78 : 93, status: simulatedAnomaly ? 'ALERT' : 'NORMAL', csp: simulatedAnomaly ? 2490 : 2830 },
                { id: 'RF-05', count: '30s Carded', rpm: 18800, oee: 95, status: 'NORMAL', csp: 2430 },
                { id: 'RF-06', count: '30s Carded', rpm: 18750, oee: 94, status: 'NORMAL', csp: 2415 },
              ].map(rf => (
                <div key={rf.id} className={`ring-frame-card ${rf.status === 'ALERT' ? 'rf-alert' : ''}`}>
                  <div className="rf-header">
                    <div>
                      <strong>{rf.id}</strong>
                      <span className="rf-count">{rf.count}</span>
                    </div>
                    <span className={`rf-status-badge ${rf.status === 'ALERT' ? 'badge-alert' : 'badge-normal'}`}>
                      {rf.status}
                    </span>
                  </div>
                  <div className="rf-metrics">
                    <div>
                      <span>Speed</span>
                      <strong>{rf.rpm.toLocaleString()} RPM</strong>
                    </div>
                    <div>
                      <span>CSP Lea</span>
                      <strong>{rf.csp}</strong>
                    </div>
                    <div>
                      <span>OEE</span>
                      <strong>{rf.oee}%</strong>
                    </div>
                  </div>
                  <div className="rf-progress-bar">
                    <div className="rf-progress-fill" style={{ width: `${rf.oee}%`, background: rf.status === 'ALERT' ? 'var(--rose)' : 'var(--emerald)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="spindle-anomaly-bar">
              <button
                className="btn-ghost btn-sm"
                onClick={() => setSimulatedAnomaly(!simulatedAnomaly)}
              >
                {simulatedAnomaly ? '✅ Clear Anomaly' : '⚠️ Simulate End-Breakage Anomaly on Frame #04'}
              </button>
              {simulatedAnomaly && (
                <div className="sim-whatsapp-preview">
                  <span className="wa-icon">📱</span>
                  <span><strong>WhatsApp Alert to Mill Master:</strong> "Ring Frame #04 end-breakage jumped to 9.2 per 1000 sp-hr on 40s Combed Lot #9402. Check traveller wear."</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: 30-DAY ACTIVE GRACE QUOTA & UTR REACTIVATION ─── */}
        {activeTab === 'GRACE' && (
          <div className="sim-grace-view">
            <div className="grace-status-banner">
              <div className="grace-shield-icon">🛡️</div>
              <div className="grace-banner-text">
                <h4>{graceReactivated ? '🎉 LICENSE FULLY REACTIVATED & EXTENDED' : 'SUBSCRIPTION EXPIRED · 30-DAY ACTIVE GRACE UNLOCKED'}</h4>
                <p>
                  {graceReactivated
                    ? 'Verified UTR confirmed via Bank Webhook. Relational database active through October 2027. Zero downtime experienced.'
                    : 'Your mill operations are 100% unrestricted. Weighbridge tare locks, yarn dispatch, and GST invoicing continue without disruption. Test our 3-minute reactivation engine below!'}
                </p>
              </div>
              <div className="grace-days-badge">
                {graceReactivated ? 'ACTIVE LTS' : 'DAY 14 OF 30'}
              </div>
            </div>

            <div className="grace-interactive-grid">
              <div className="grace-reassurance-card">
                <h5>What Continues Working in Grace Period?</h5>
                <ul className="grace-checklist">
                  <li><span className="check-ok">✓</span> <strong>Weighbridge & Inward:</strong> Operators can weigh trucks and log moisture deductions without pause.</li>
                  <li><span className="check-ok">✓</span> <strong>Ring Frame Telemetry:</strong> Shift production tracking and spindle counts continue recording.</li>
                  <li><span className="check-ok">✓</span> <strong>Tally Prime & GST Billing:</strong> Generate tax invoices, E-Way bills, and XML exports freely.</li>
                  <li><span className="check-ok">✓</span> <strong>Zero Lockout Policy:</strong> No factory gate has ever been halted by EverGreen licensing.</li>
                </ul>
              </div>

              <div className="grace-reactivation-box">
                <h5>Instant UTR Reactivation Test</h5>
                <p>When you pay via RTGS / NEFT / UPI, paste your bank UTR number here to watch our provider engine reactivate the license in under 3 minutes.</p>

                <div className="utr-input-group">
                  <label>Bank Remittance UTR Number</label>
                  <div className="utr-input-row">
                    <input
                      type="text"
                      value={utrInput}
                      onChange={e => setUtrInput(e.target.value)}
                      placeholder="e.g. HDFC20261015992"
                      className="utr-input"
                    />
                    <button
                      className="btn-primary btn-sm"
                      onClick={triggerReactivation}
                      disabled={reactivationStep === 1 || reactivationStep === 2}
                    >
                      {reactivationStep === 1 ? 'Verifying...' : reactivationStep === 2 ? 'Signing...' : '⚡ Reactivate Now'}
                    </button>
                  </div>
                </div>

                <div className="reactivation-pipeline">
                  <div className={`pipeline-step ${reactivationStep >= 1 ? 'step-done' : ''}`}>
                    <span className="step-num">1</span>
                    <span>Bank Statement Webhook</span>
                  </div>
                  <div className="pipeline-line" />
                  <div className={`pipeline-step ${reactivationStep >= 2 ? 'step-done' : ''}`}>
                    <span className="step-num">2</span>
                    <span>ECDSA License Key</span>
                  </div>
                  <div className="pipeline-line" />
                  <div className={`pipeline-step ${reactivationStep >= 3 ? 'step-done' : ''}`}>
                    <span className="step-num">3</span>
                    <span>Mill Tenant Relational DB Unlocked</span>
                  </div>
                </div>

                {graceReactivated && (
                  <div className="reactivation-success-note">
                    ✅ <strong>Reactivation Confirmed in 18 Seconds!</strong> Mill license renewed with cryptographic certificate. Zero data migration or re-installation needed.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sim-footer">
        <div className="sim-footer-text">
          <span>🚀 Ready to deploy EverGreen at your spinning mill? We install in under 8 minutes.</span>
        </div>
        <button className="btn-primary" onClick={onStartPoc}>
          {lang === 'ta' ? '30-நாள் இலவச POC துவங்குங்கள் →' : 'Start Free 30-Day Mill POC →'}
        </button>
      </div>
    </div>
  );
}
