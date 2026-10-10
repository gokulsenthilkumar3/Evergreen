/**
 * Industrial Thermal Label Driver (TSPL for TSC / ZPL for Zebra)
 * Formats direct byte streams for 203 DPI thermal tag printers.
 */

export interface LabelData {
  millName: string;
  lotNumber: string;
  supplier: string;
  date: string;
  bales: number;
  grossKg: number;
  tareKg: number;
  netKg: number;
  moisturePercent: number;
  antiFraudSeal: string;
}

export class ThermalPrinterDriver {
  /**
   * Generate TSPL (TSC Printer Language) byte commands for a 2" x 1" or 4" x 2" label
   */
  static generateTsplCommand(data: LabelData): string {
    return [
      'SIZE 4,2',
      'GAP 0.12,0',
      'DIRECTION 1',
      'CLS',
      // Mill Name & Header
      `TEXT 20,20,"3",0,1,1,"${data.millName.substring(0, 24)}"`,
      `TEXT 20,55,"2",0,1,1,"LOT: ${data.lotNumber}"`,
      `TEXT 20,85,"2",0,1,1,"SUPP: ${data.supplier.substring(0, 20)}"`,
      // Weight Metrics
      `TEXT 20,120,"2",0,1,1,"BALES: ${data.bales} | GROSS: ${data.grossKg} kg"`,
      `TEXT 20,150,"2",0,1,1,"TARE: ${data.tareKg} kg | MOIST: ${data.moisturePercent}%"`,
      `TEXT 20,180,"3",0,1,1,"NET BILLABLE: ${data.netKg} KG"`,
      `TEXT 20,220,"1",0,1,1,"SEAL: ${data.antiFraudSeal} | ${data.date}"`,
      // Barcode Code-128
      `BARCODE 20,250,"128",60,1,0,2,2,"${data.lotNumber}"`,
      // QR Code with tamper verification string
      `QRCODE 550,50,L,5,A,0,"LOT=${data.lotNumber};NET=${data.netKg};SEAL=${data.antiFraudSeal}"`,
      'PRINT 1,1',
      '',
    ].join('\r\n');
  }

  /**
   * Generate ZPL II (Zebra Programming Language) commands
   */
  static generateZplCommand(data: LabelData): string {
    return [
      '^XA',
      '^PW812',
      '^LL406',
      // Mill Header
      `^FO30,30^A0N,30,30^FD${data.millName}^FS`,
      `^FO30,70^A0N,28,28^FDLOT: ${data.lotNumber}^FS`,
      `^FO30,105^A0N,24,24^FDSUPPLIER: ${data.supplier}^FS`,
      // Weight breakdown
      `^FO30,140^A0N,24,24^FDBALES: ${data.bales}  GROSS: ${data.grossKg} kg  TARE: ${data.tareKg} kg^FS`,
      `^FO30,175^A0N,24,24^FDMOISTURE: ${data.moisturePercent}%  SEAL: ${data.antiFraudSeal}^FS`,
      `^FO30,210^A0N,36,36^FDNET BILLABLE: ${data.netKg} KG^FS`,
      // Barcode 128
      `^FO30,260^BCN,70,Y,N,N^FD${data.lotNumber}^FS`,
      // QR Code
      `^FO580,40^BQN,2,5^FDLA,LOT:${data.lotNumber},NET:${data.netKg},SEAL:${data.antiFraudSeal}^FS`,
      '^XZ',
      '',
    ].join('\n');
  }
}
