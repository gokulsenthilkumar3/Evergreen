import { useState } from 'react';

interface Props {
  onStartPoc: () => void;
  lang?: 'en' | 'ta';
}

interface CountPreset {
  name: string;
  count: string;
  baseRealization: number;
  marketPricePerKg: number;
  powerUnitsPerKg: number;
  spindleGramsPerDay: number;
}

const COUNT_PRESETS: Record<string, CountPreset> = {
  '20s_oe': {
    name: '20s OE (Open End Rotor)',
    count: '20s OE',
    baseRealization: 91.5,
    marketPricePerKg: 215,
    powerUnitsPerKg: 2.1,
    spindleGramsPerDay: 420,
  },
  '30s_carded': {
    name: '30s Carded Weaving Yarn',
    count: '30s CH',
    baseRealization: 84.8,
    marketPricePerKg: 260,
    powerUnitsPerKg: 3.4,
    spindleGramsPerDay: 230,
  },
  '40s_combed': {
    name: '40s Combed Hosiery (Tirupur Standard)',
    count: '40s KWH',
    baseRealization: 72.4,
    marketPricePerKg: 310,
    powerUnitsPerKg: 4.2,
    spindleGramsPerDay: 165,
  },
  '60s_compact': {
    name: '60s Compact Warp Weaving',
    count: '60s CW',
    baseRealization: 68.2,
    marketPricePerKg: 415,
    powerUnitsPerKg: 6.8,
    spindleGramsPerDay: 95,
  },
  '80s_superfine': {
    name: '80s Superfine Compact Giza',
    count: '80s SC',
    baseRealization: 64.0,
    marketPricePerKg: 580,
    powerUnitsPerKg: 9.6,
    spindleGramsPerDay: 62,
  },
};

export function YarnRealizationCalculator({ onStartPoc, lang = 'en' }: Props) {
  const [calcMode, setCalcMode] = useState<'QUICK_FRAUD' | 'DEEP_MATRIX'>('DEEP_MATRIX');

  // Parameters
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('40s_combed');
  const [spindles, setSpindles] = useState<number>(18000);
  const [candyRate, setCandyRate] = useState<number>(62000); // 1 Candy = 355 kg
  const [comberNoilPct, setComberNoilPct] = useState<number>(15.5);
  const [powerTariff, setPowerTariff] = useState<number>(7.8); // ₹ per kWh
  const [moistureExcessPct, setMoistureExcessPct] = useState<number>(1.2);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const preset = COUNT_PRESETS[selectedPresetKey];

  // Textile Math
  // 1 candy = 355 kg => Raw Cotton Price per kg
  const rawCottonPricePerKg = candyRate / 355;

  // Realization adjustment: 40s/60s/80s combed are adjusted by comber noil %
  const effectiveRealizationPct = selectedPresetKey.includes('oe') || selectedPresetKey.includes('carded')
    ? preset.baseRealization
    : Math.max(55, Math.min(80, preset.baseRealization - (comberNoilPct - 15.5)));

  // Clean cotton required per kg of yarn = 1 / (realization % / 100)
  const cleanCottonCostPerKg = rawCottonPricePerKg / (effectiveRealizationPct / 100);

  // Waste recovery credit (comber noil sells for ~65% of cotton price)
  const wasteGeneratedPct = 100 - effectiveRealizationPct;
  const wasteCreditPerKg = (rawCottonPricePerKg * 0.60) * (wasteGeneratedPct / 100);

  // Net cotton cost per kg of yarn
  const netCottonCostPerKg = cleanCottonCostPerKg - wasteCreditPerKg;

  // Power cost per kg of yarn
  const powerCostPerKg = preset.powerUnitsPerKg * powerTariff;

  // Other conversion cost (labour, stores, packaging, admin) ~ ₹22 - ₹38 depending on count
  const conversionCostPerKg = 24 + (preset.powerUnitsPerKg * 1.5);

  // Total yarn production cost per kg
  const totalCostPerKg = Math.round(netCottonCostPerKg + powerCostPerKg + conversionCostPerKg);

  // Profit margin per kg
  const marginPerKg = preset.marketPricePerKg - totalCostPerKg;

  // Daily production in kg
  const dailyYarnOutputKg = Math.round((spindles * preset.spindleGramsPerDay) / 1000);
  const monthlyYarnOutputKg = dailyYarnOutputKg * 26;

  // Monthly Net Profit
  const monthlyMillProfit = Math.round(monthlyYarnOutputKg * marginPerKg);

  // Annual Moisture Fraud Recovered
  const dailyCottonConsumptionKg = dailyYarnOutputKg / (effectiveRealizationPct / 100);
  const monthlyCottonSpend = dailyCottonConsumptionKg * 26 * rawCottonPricePerKg;
  const monthlyMoistureLossSaved = Math.round(monthlyCottonSpend * (moistureExcessPct / 100));
  const annualFraudRecovered = monthlyMoistureLossSaved * 12;

  const handleCopySummary = () => {
    const text = `EverGreen OS Textile Feasibility Summary:
- Count: ${preset.name}
- Spindles: ${spindles.toLocaleString()}
- Candy Rate: ₹${candyRate.toLocaleString()} / candy
- Realization: ${effectiveRealizationPct.toFixed(1)}%
- Total Production Cost: ₹${totalCostPerKg} / kg
- Market Price: ₹${preset.marketPricePerKg} / kg
- Margin: ₹${marginPerKg} / kg (${((marginPerKg / preset.marketPricePerKg) * 100).toFixed(1)}%)
- Monthly Profit: ₹${(monthlyMillProfit / 100000).toFixed(2)} Lakhs
- Annual Moisture Fraud Recovered by TareZero: ₹${(annualFraudRecovered / 100000).toFixed(2)} Lakhs`;

    navigator.clipboard?.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="calc-container glass-card">
      <div className="calc-mode-switch">
        <button
          className={`mode-btn ${calcMode === 'DEEP_MATRIX' ? 'active' : ''}`}
          onClick={() => setCalcMode('DEEP_MATRIX')}
        >
          <span>📊</span>
          <span>{lang === 'ta' ? 'நூற்பாலை லாப & கவுண்ட் மேட்ரிக்ஸ்' : 'Deep Spinning Mill Profit & Yarn Realization Matrix'}</span>
        </button>
        <button
          className={`mode-btn ${calcMode === 'QUICK_FRAUD' ? 'active' : ''}`}
          onClick={() => setCalcMode('QUICK_FRAUD')}
        >
          <span>⚖️</span>
          <span>{lang === 'ta' ? 'எடைமேடை ஈரம் சேமிப்பு' : 'Weighbridge Moisture Fraud ROI'}</span>
        </button>
      </div>

      {calcMode === 'DEEP_MATRIX' ? (
        <div className="matrix-layout">
          <div className="matrix-inputs">
            <div className="matrix-field">
              <label>Select Yarn Count & Quality</label>
              <select
                value={selectedPresetKey}
                onChange={e => setSelectedPresetKey(e.target.value)}
                className="matrix-select"
              >
                {Object.entries(COUNT_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name} · ₹{item.marketPricePerKg}/kg
                  </option>
                ))}
              </select>
            </div>

            <div className="matrix-slider-row">
              <div className="matrix-slider-group">
                <div className="slider-label-row">
                  <span>Active Spindles</span>
                  <strong>{spindles.toLocaleString()}</strong>
                </div>
                <input
                  type="range"
                  min="6000"
                  max="60000"
                  step="2000"
                  value={spindles}
                  onChange={e => setSpindles(Number(e.target.value))}
                  className="calc-slider"
                />
              </div>

              <div className="matrix-slider-group">
                <div className="slider-label-row">
                  <span>Cotton Candy Rate</span>
                  <strong>₹{candyRate.toLocaleString()} <small>/ 355 kg</small></strong>
                </div>
                <input
                  type="range"
                  min="48000"
                  max="78000"
                  step="1000"
                  value={candyRate}
                  onChange={e => setCandyRate(Number(e.target.value))}
                  className="calc-slider"
                />
              </div>
            </div>

            <div className="matrix-slider-row">
              <div className="matrix-slider-group">
                <div className="slider-label-row">
                  <span>Comber Noil Extraction</span>
                  <strong>{comberNoilPct.toFixed(1)}%</strong>
                </div>
                <input
                  type="range"
                  min="11.0"
                  max="20.0"
                  step="0.5"
                  value={comberNoilPct}
                  onChange={e => setComberNoilPct(Number(e.target.value))}
                  className="calc-slider"
                  disabled={selectedPresetKey.includes('oe') || selectedPresetKey.includes('carded')}
                />
                <small className="slider-subhint">
                  {selectedPresetKey.includes('oe') ? 'No comber in Open-End Rotor' : 'Standard hosiery norm: 14%–17%'}
                </small>
              </div>

              <div className="matrix-slider-group">
                <div className="slider-label-row">
                  <span>Electricity Tariff (EB Unit)</span>
                  <strong>₹{powerTariff.toFixed(2)} <small>/ kWh</small></strong>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.5"
                  step="0.2"
                  value={powerTariff}
                  onChange={e => setPowerTariff(Number(e.target.value))}
                  className="calc-slider"
                />
                <small className="slider-subhint">TANGEDCO Grid: ₹8.00 · Captive Solar/Wind: ₹4.20</small>
              </div>
            </div>

            <div className="matrix-slider-group">
              <div className="slider-label-row">
                <span>Moisture TareZero Intercept</span>
                <strong style={{ color: 'var(--amber)' }}>{moistureExcessPct.toFixed(1)}% excess water blocked</strong>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={moistureExcessPct}
                onChange={e => setMoistureExcessPct(Number(e.target.value))}
                className="calc-slider"
              />
            </div>
          </div>

          <div className="matrix-results-panel">
            <div className="matrix-headline-card">
              <div className="matrix-headline-sub">PROJECTED MONTHLY MILL MARGIN</div>
              <div className="matrix-headline-val">
                ₹{(monthlyMillProfit / 100000).toFixed(2)} <span className="lakhs">Lakhs / mo</span>
              </div>
              <div className="matrix-headline-meta">
                <span>Yarn Output: {Math.round(monthlyYarnOutputKg / 1000)} Tons/mo</span>
                <span>Margin: ₹{marginPerKg}/kg ({((marginPerKg / preset.marketPricePerKg) * 100).toFixed(1)}%)</span>
              </div>
            </div>

            <div className="cost-breakdown-table">
              <div className="cost-row">
                <span>Effective Yarn Realization</span>
                <strong>{effectiveRealizationPct.toFixed(1)}%</strong>
              </div>
              <div className="cost-row">
                <span>Net Raw Cotton Cost</span>
                <span>₹{Math.round(netCottonCostPerKg)} / kg</span>
              </div>
              <div className="cost-row">
                <span>Power Cost ({preset.powerUnitsPerKg} units/kg)</span>
                <span>₹{Math.round(powerCostPerKg)} / kg</span>
              </div>
              <div className="cost-row">
                <span>Labour, Stores & Packaging</span>
                <span>₹{Math.round(conversionCostPerKg)} / kg</span>
              </div>
              <div className="cost-row cost-row-total">
                <span>Total Cost of Production (COP)</span>
                <strong style={{ color: 'var(--sky)' }}>₹{totalCostPerKg} / kg</strong>
              </div>
              <div className="cost-row cost-row-selling">
                <span>Market Selling Realization</span>
                <strong style={{ color: 'var(--emerald)' }}>₹{preset.marketPricePerKg} / kg</strong>
              </div>
            </div>

            <div className="fraud-recovery-badge">
              <span>🛡️ TareZero Bonus: <strong>₹{(annualFraudRecovered / 100000).toFixed(2)}L/yr</strong> saved on moisture fraud</span>
            </div>

            <div className="matrix-actions">
              <button className="btn-copy-summary" onClick={handleCopySummary}>
                {copiedSummary ? '✅ Feasibility Copied!' : '📋 Copy Feasibility Summary'}
              </button>
              <button className="btn-primary" onClick={onStartPoc}>
                🚀 Request Customized Mill Audit Report
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="quick-fraud-layout">
          <div className="quick-fraud-inputs">
            <div className="calc-input-group">
              <label>Active Spindles: <strong className="calc-val">{spindles.toLocaleString()}</strong></label>
              <input type="range" min="3000" max="60000" step="1000" value={spindles}
                onChange={e => setSpindles(Number(e.target.value))} className="calc-slider" />
              <div className="calc-slider-labels"><span>3,000 Spindles</span><span>60,000 Spindles</span></div>
            </div>
            <div className="calc-input-group">
              <label>Cotton Candy Rate: <strong className="calc-val">₹{candyRate.toLocaleString()} / candy (355 kg)</strong></label>
              <input type="range" min="45000" max="80000" step="1000" value={candyRate}
                onChange={e => setCandyRate(Number(e.target.value))} className="calc-slider" />
            </div>
            <div className="calc-input-group">
              <label>TareZero Moisture Fraud Intercept: <strong className="calc-val">{moistureExcessPct.toFixed(1)}% excess weight</strong></label>
              <input type="range" min="0.4" max="3.0" step="0.1" value={moistureExcessPct}
                onChange={e => setMoistureExcessPct(Number(e.target.value))} className="calc-slider" />
            </div>
          </div>

          <div className="quick-fraud-results">
            <div className="calc-result-card result-emerald">
              <div className="calc-result-val">₹{(annualFraudRecovered / 100000).toFixed(1)}L / yr</div>
              <div className="calc-result-label">Annual Fraud Recovered by TareZero</div>
            </div>
            <div className="calc-result-card result-amber">
              <div className="calc-result-val">₹{(monthlyMoistureLossSaved / 1000).toFixed(0)}K / mo</div>
              <div className="calc-result-label">Monthly Invisible Water Weight Saved</div>
            </div>
            <div className="calc-result-card result-purple">
              <div className="calc-result-val">{Math.round(monthlyYarnOutputKg / 1000)}T / mo</div>
              <div className="calc-result-label">Yarn Production Tracked</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
