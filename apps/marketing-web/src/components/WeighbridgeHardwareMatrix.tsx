import { useState } from 'react';

interface Props {
  onStartPoc: () => void;
  lang?: 'en' | 'ta';
}

interface HardwareProfile {
  id: string;
  name: string;
  vendor: string;
  icon: string;
  status: 'CERTIFIED' | 'PLUG_AND_PLAY' | 'CONFIGURABLE';
  interfaceType: string;
  baudRate: string;
  packetFormat: string;
  tareLockSupport: string;
  moistureEngine: string;
  wiring: { pin: string; function: string }[];
  commandSample: string;
}

const HARDWARE_MODELS: HardwareProfile[] = [
  {
    id: 'avery_e1105',
    name: 'Avery Weigh-Tronix E1105 / E1205',
    vendor: 'Avery India Ltd',
    icon: '⚖️',
    status: 'CERTIFIED',
    interfaceType: 'RS-232 Serial (DB9 Female) / Current Loop',
    baudRate: '9600 Baud · 8 Data Bits · No Parity · 1 Stop Bit',
    packetFormat: 'ST,GS,+034280kg\\r\\n (Continuous or On-Demand STABLE print)',
    tareLockSupport: 'Hardware-Level Auto Tare Lock (Anti-Tamper Cryptographic Seal)',
    moistureEngine: 'Direct SIMA/CCI 8.5% allowance deduction table applied before DB commit',
    wiring: [
      { pin: 'Pin 2 (RXD)', function: 'Receives continuous weight packets from E1105' },
      { pin: 'Pin 3 (TXD)', function: 'Zero / Tare command trigger' },
      { pin: 'Pin 5 (GND)', function: 'Signal Ground (isolated factory shielding)' },
    ],
    commandSample: 'evergreen-agent weighbridge test --indicator=avery-e1105 --port=COM3 --baud=9600',
  },
  {
    id: 'essae_501',
    name: 'Essae Teraoka 501 / 502 / DS-215',
    vendor: 'Essae-Teraoka Ltd',
    icon: '🔢',
    status: 'CERTIFIED',
    interfaceType: 'RS-232 / RS-485 Multi-Drop Factory Loop',
    baudRate: '4800 / 9600 Baud · 8-N-1 Continuous Stream',
    packetFormat: '=034280\\r\\n [Essae ASCII Indicator Format]',
    tareLockSupport: 'Dual stable weight verification (0.4s window stability check)',
    moistureEngine: 'Automated wet cotton bale deduction + QR barcode ticket generation',
    wiring: [
      { pin: 'Pin 2 (RXD)', function: 'Serial Data in' },
      { pin: 'Pin 3 (TXD)', function: 'Transmit command' },
      { pin: 'Pin 7 (GND)', function: 'Chassis ground' },
    ],
    commandSample: 'evergreen-agent weighbridge test --indicator=essae-501 --port=/dev/ttyUSB0',
  },
  {
    id: 'mettler_ind570',
    name: 'Mettler-Toledo IND570 / IND231',
    vendor: 'Mettler-Toledo India',
    icon: '⚙️',
    status: 'CERTIFIED',
    interfaceType: 'Ethernet TCP/IP Socket & RS-232 SICS',
    baudRate: '19200 Baud / Direct IP Socket (Port 4001)',
    packetFormat: 'S S      34280.00 kg\\r\\n [Mettler Standard Interface Command Set]',
    tareLockSupport: 'Cryptographic hardware tare lock with mill manager biometric passkey',
    moistureEngine: 'High-precision lea testing lab & weighbridge composite moisture sync',
    wiring: [
      { pin: 'RJ-45 CAT6', function: 'Direct Factory LAN connection to EverGreen server' },
      { pin: 'Pin 2 / 3', function: 'Fallback RS-232 diagnostic port' },
    ],
    commandSample: 'evergreen-agent weighbridge test --indicator=mettler-sics --host=192.168.1.120',
  },
  {
    id: 'contech_cw',
    name: 'Contech Instruments CW / CA Series',
    vendor: 'Contech Instruments',
    icon: '📦',
    status: 'PLUG_AND_PLAY',
    interfaceType: 'RS-232 DB9 Male / USB-to-UART FTDI',
    baudRate: '9600 Baud · 8-N-1 · Continuous Stream',
    packetFormat: '+ 034280 kg\\r\\n [Standard Industrial Weight Header]',
    tareLockSupport: 'Software tare verification with anti-roll rollback detection',
    moistureEngine: 'Moisture deduction matrix with broker dispute PDF generator',
    wiring: [
      { pin: 'Pin 2 (RX)', function: 'Data receive' },
      { pin: 'Pin 5 (GND)', function: 'Reference Ground' },
    ],
    commandSample: 'evergreen-agent weighbridge test --indicator=contech-cw --port=COM1',
  },
  {
    id: 'sartorius_combics',
    name: 'Sartorius Combics 3 / Midrics',
    vendor: 'Sartorius AG',
    icon: '🧪',
    status: 'CERTIFIED',
    interfaceType: 'RS-232 / RS-422 / Profibus DP',
    baudRate: '9600 Baud · 7-E-1 or 8-N-1 SBI Protocol',
    packetFormat: 'ST +   34280 kg \\r\\n [Sartorius Balance Interface]',
    tareLockSupport: 'Certified laboratory grade stability verification',
    moistureEngine: 'Moisture regain curve auto-calibration for combed yarn cones',
    wiring: [
      { pin: 'Pin 3 (RXD)', function: 'SBI Stream Input' },
      { pin: 'Pin 5 (GND)', function: 'Shield Ground' },
    ],
    commandSample: 'evergreen-agent weighbridge test --indicator=sartorius-sbi --port=COM4',
  },
  {
    id: 'cardinal_iq',
    name: 'Cardinal Scale / Rice Lake 355',
    vendor: 'Rice Lake / Cardinal Scale',
    icon: '🚛',
    status: 'PLUG_AND_PLAY',
    interfaceType: 'RS-232 Serial / 20mA Current Loop',
    baudRate: '9600 Baud · 8-N-1',
    packetFormat: '<STX> 34280 <ETX> [Truck Scale Enclosed Frame]',
    tareLockSupport: 'Motion-detect tare latch with gross weight freeze',
    moistureEngine: 'Full SIMA/CCI standard inward deduction',
    wiring: [
      { pin: 'Pin 2 (RX)', function: 'Serial Stream' },
      { pin: 'Pin 5 (GND)', function: 'Signal Common' },
    ],
    commandSample: 'evergreen-agent weighbridge test --indicator=ricelake-355 --port=COM2',
  },
];

export function WeighbridgeHardwareMatrix({ onStartPoc, lang = 'en' }: Props) {
  const [selectedId, setSelectedId] = useState<string>('avery_e1105');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const selected = HARDWARE_MODELS.find(m => m.id === selectedId) || HARDWARE_MODELS[0];

  const handleCopyCmd = () => {
    navigator.clipboard?.writeText(selected.commandSample);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2200);
  };

  return (
    <div className="hardware-section-box glass-card">
      <div className="hardware-top-bar">
        <div className="hw-intro">
          <span className="hw-badge">⚡ 100% HARDWARE COMPATIBILITY</span>
          <h3>{lang === 'ta' ? 'உங்கள் ஆலை எடைமேடை இண்டிகேட்டரை தேர்ந்தெடுக்கவும்' : 'Select Your Mill’s Weighbridge Indicator Model'}</h3>
          <p>{lang === 'ta' ? 'எந்தவொரு எடைமேடை இண்டிகேட்டருடனும் EverGreen-இன் TareZero RS-232 டிரைவர் உடனடியாக இணைகிறது.' : 'EverGreen TareZero connects directly with Avery, Essae, Mettler, Contech, and Sartorius scales via standard serial cables. Zero equipment replacement required.'}</p>
        </div>
      </div>

      <div className="hardware-grid-layout">
        <div className="hw-selector-list">
          {HARDWARE_MODELS.map(m => (
            <div
              key={m.id}
              className={`hw-model-item ${m.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(m.id)}
            >
              <span className="hw-item-icon">{m.icon}</span>
              <div className="hw-item-info">
                <strong>{m.name}</strong>
                <span>{m.vendor} · {m.interfaceType.split('/')[0]}</span>
              </div>
              <span className={`hw-status-pill ${m.status === 'CERTIFIED' ? 'pill-certified' : 'pill-plug'}`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>

        <div className="hw-details-card">
          <div className="hw-details-head">
            <div className="hw-details-title-row">
              <span className="hw-big-icon">{selected.icon}</span>
              <div>
                <h4>{selected.name}</h4>
                <div className="hw-vendor-badge">{selected.vendor} · {selected.status}</div>
              </div>
            </div>
            <div className="hw-certified-seal">
              <span>✓ EVERGREEN CERTIFIED</span>
            </div>
          </div>

          <div className="hw-specs-grid">
            <div className="hw-spec-item">
              <span className="spec-label">Serial Interface & Cable</span>
              <span className="spec-val">{selected.interfaceType}</span>
            </div>
            <div className="hw-spec-item">
              <span className="spec-label">Baud Rate & Parity</span>
              <span className="spec-val font-mono">{selected.baudRate}</span>
            </div>
            <div className="hw-spec-item full-width">
              <span className="spec-label">Expected Live Packet Format</span>
              <code className="spec-code">{selected.packetFormat}</code>
            </div>
            <div className="hw-spec-item full-width">
              <span className="spec-label">Hardware-Level Tare Lock</span>
              <span className="spec-val">{selected.tareLockSupport}</span>
            </div>
            <div className="hw-spec-item full-width">
              <span className="spec-label">SIMA / CCI Moisture Deduction</span>
              <span className="spec-val">{selected.moistureEngine}</span>
            </div>
          </div>

          <div className="hw-wiring-box">
            <div className="wiring-title">🔌 Standard DB9 Pinout Specification</div>
            <div className="wiring-pins-row">
              {selected.wiring.map((w, idx) => (
                <div key={idx} className="wiring-pin-card">
                  <strong>{w.pin}</strong>
                  <span>{w.function}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hw-cmd-box">
            <div className="cmd-label">One-Line Diagnostic Command (Run on Mill PC):</div>
            <div className="cmd-line-row">
              <code>{selected.commandSample}</code>
              <button className="btn-copy-cmd" onClick={handleCopyCmd}>
                {copiedCmd ? '✅ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="hw-actions">
            <button className="btn-primary" onClick={onStartPoc}>
              🚀 Schedule On-Site Weighbridge Calibration Visit
            </button>
            <span className="hw-note">
              Our field engineer brings DB9/RS-232 shielded cables and calibrates your indicator in Tirupur, Coimbatore, Erode, or Karur.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
