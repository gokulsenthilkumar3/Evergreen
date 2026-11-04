import { useState } from 'react';

interface Props {
  onStartPoc: () => void;
  lang?: 'en' | 'ta';
}

const HARDWARE_MODELS = [
  { id: 'avery_e1105', name: 'Avery Weigh-Tronix E1105 / E1205', vendor: 'Avery India Ltd', icon: '⚖️' },
  { id: 'essae_501', name: 'Essae Teraoka 501 / 502 / DS-215', vendor: 'Essae-Teraoka Ltd', icon: '🔢' },
  { id: 'mettler_ind570', name: 'Mettler-Toledo IND570 / IND231', vendor: 'Mettler-Toledo India', icon: '⚙️' },
  { id: 'contech_cw', name: 'Contech Instruments CW / CA Series', vendor: 'Contech Instruments', icon: '📦' },
  { id: 'sartorius_combics', name: 'Sartorius Combics 3 / Midrics', vendor: 'Sartorius AG', icon: '🧪' },
  { id: 'cardinal_iq', name: 'Cardinal Scale / Rice Lake 355', vendor: 'Rice Lake / Cardinal Scale', icon: '🚛' },
];

export function WeighbridgeHardwareMatrix({ onStartPoc, lang = 'en' }: Props) {
  const [selectedId, setSelectedId] = useState('avery_e1105');
  const selected = HARDWARE_MODELS.find(model => model.id === selectedId) || HARDWARE_MODELS[0];
  return (
    <div className="hardware-section-box glass-card">
      <div className="hardware-top-bar">
        <div className="hw-intro">
          <span className="hw-badge">SUPPORTED-DEVICE PILOT REQUIRED</span>
          <h3>{lang === 'ta' ? 'உங்கள் கருவிக்கான சோதனையைத் திட்டமிடுங்கள்' : 'Plan an Indicator Compatibility Check'}</h3>
          <p>{lang === 'ta' ? 'இவை சோதனைக்கான கருவி உதாரணங்கள். பொருத்தம் அல்லது சான்றளிப்பு உறுதிப்படுத்தப்படவில்லை.' : 'These are candidate indicator examples. Compatibility and certification have not been established for these models.'}</p>
        </div>
      </div>
      <div className="hardware-grid-layout">
        <div className="hw-selector-list">
          {HARDWARE_MODELS.map(model => (
            <button key={model.id} className={'hw-model-item ' + (model.id === selectedId ? 'active' : '')}
              onClick={() => setSelectedId(model.id)} aria-pressed={model.id === selectedId}>
              <span className="hw-item-icon">{model.icon}</span>
              <span className="hw-item-info"><strong>{model.name}</strong><span>{model.vendor}</span></span>
              <span className="hw-status-pill pill-plug">PILOT REQUIRED</span>
            </button>
          ))}
        </div>
        <div className="hw-details-card">
          <div className="hw-details-head">
            <div className="hw-details-title-row">
              <span className="hw-big-icon">{selected.icon}</span>
              <div><h4>{selected.name}</h4><div className="hw-vendor-badge">{selected.vendor} · Candidate profile</div></div>
            </div>
          </div>
          <div className="hw-specs-grid">
            <div className="hw-spec-item full-width"><span className="spec-label">Connection and protocol</span><span className="spec-val">Confirm the exact model, firmware, port, cable pinout and serial settings from its manufacturer documentation.</span></div>
            <div className="hw-spec-item full-width"><span className="spec-label">Capture acceptance</span><span className="spec-val">Test stable gross/tare readings, disconnects, calibration and a provisioned device identity on physical equipment.</span></div>
            <div className="hw-spec-item full-width"><span className="spec-label">Moisture calculation</span><span className="spec-val">Use the allowance agreed in the purchase contract. A parser or signature does not establish physical anti-tamper protection.</span></div>
          </div>
          <div className="hw-actions">
            <button className="btn-primary" onClick={onStartPoc}>Prepare a hardware pilot enquiry</button>
            <span className="hw-note">This page does not connect to hardware, issue a calibration certificate or book an engineer visit.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
