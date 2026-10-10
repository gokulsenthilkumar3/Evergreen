import { IndicatorProtocolParser } from './indicator-parsers';
import { AntiTamperEngine, type WeightRecordPayload } from './anti-tamper';
import { ThermalPrinterDriver, type LabelData } from './thermal-printer';

export {
  IndicatorProtocolParser,
  AntiTamperEngine,
  ThermalPrinterDriver,
  type WeightRecordPayload,
  type LabelData,
};

/**
 * Example Standalone Runner for Weighbridge PC
 */
export async function runAgentSimulation() {
  console.log('==> [EverGreen Weighbridge Agent] Starting hardware listener...');

  // 1. Simulate reading raw RS-232 frame from an Avery Weight-Tronix indicator
  const simulatedRawWeight = 'ST,GS,+014520kg\r\n';
  const weightReading = IndicatorProtocolParser.parseWeightFrame(simulatedRawWeight);
  console.log('✓ Parsed Live Indicator Frame:', weightReading);

  // 2. Simulate reading raw frame from moisture meter
  const simulatedRawMoisture = 'M: 09.2%\r\n';
  const moistureReading = IndicatorProtocolParser.parseMoistureFrame(simulatedRawMoisture);
  console.log('✓ Parsed Moisture Meter Frame:', moistureReading);

  if (weightReading && moistureReading) {
    const grossKg = weightReading.weightKg;
    const tareKg = 4200; // Truck tare weight
    const secretKey = 'mill_weighbridge_secret_device_001';

    const payload: WeightRecordPayload = {
      deviceSerial: 'AVERY-E1205-SN9821',
      comPort: 'COM3',
      grossWeightKg: grossKg,
      tareWeightKg: tareKg,
      moisturePercent: moistureReading.moisturePercent,
      standardMoistureBase: 8.5,
      timestamp: new Date().toISOString(),
    };

    // 3. Cryptographically sign the reading
    const signedSlip = AntiTamperEngine.signSlip(payload, secretKey);
    console.log('✓ Cryptographically Signed Slip:', signedSlip);

    // 4. Generate TSPL thermal barcode commands for TSC printer
    const labelData: LabelData = {
      millName: 'Evergreen Spinning Mills',
      lotNumber: 'LOT-40S-9921',
      supplier: 'Mahalakshmi Ginning Mill',
      date: new Date().toISOString().split('T')[0],
      bales: 48,
      grossKg,
      tareKg,
      netKg: signedSlip.calculations.finalBillableKg,
      moisturePercent: payload.moisturePercent,
      antiFraudSeal: signedSlip.antiFraudSeal,
    };

    const tsplCommands = ThermalPrinterDriver.generateTsplCommand(labelData);
    console.log('✓ Generated TSPL Barcode Command (length):', tsplCommands.length, 'bytes');

    const isValid = AntiTamperEngine.verifySlip(signedSlip, secretKey);
    console.log('✓ Local Verification Status:', isValid ? 'PASS (AUTHENTIC)' : 'FAIL');
  }
}

if (require.main === module) {
  runAgentSimulation().catch(console.error);
}
