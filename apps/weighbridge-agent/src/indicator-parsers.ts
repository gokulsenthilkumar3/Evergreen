/**
 * Industrial Indicator RS-232 / RS-485 ASCII Protocol Parsers
 * Supports: Avery Weigh-Tronix, Essae-Teraoka, Mettler-Toledo, and Digital Moisture Meters
 */

export interface ParsedWeightReading {
  raw: string;
  weightKg: number;
  isStable: boolean;
  indicatorBrand: 'AVERY' | 'ESSAE' | 'METTLER_TOLEDO' | 'GENERIC_ASCII';
  unit: 'kg' | 't' | 'lbs';
  timestamp: string;
}

export interface ParsedMoistureReading {
  raw: string;
  moisturePercent: number;
  isStable: boolean;
  meterBrand: 'KETT' | 'MCU5' | 'DELMHORST' | 'GENERIC';
  timestamp: string;
}

const LBS_TO_KG = 0.45359237;

export class IndicatorProtocolParser {
  /**
   * Parse a raw serial string buffer from a Weighbridge Indicator
   */
  static parseWeightFrame(rawFrame: string): ParsedWeightReading | null {
    const clean = rawFrame.trim();
    if (!clean) return null;

    // Reject hardware error frames immediately
    if (/\b(ERR|ERROR|OVER|UNDER|FAULT|FAIL|OL|UL)\b/i.test(clean) || /^ERR\d+/i.test(clean)) {
      return null;
    }

    // 1. Avery Weigh-Tronix: e.g. "ST,GS,+012450kg", "US,GS,+012450kg", "ST,GS,+027447lb"
    const averyMatch = clean.match(/(ST|US),GS,([+-]?\d+(?:\.\d+)?)\s*(kg|lb|lbs|t)?/i);
    if (averyMatch) {
      const isStable = averyMatch[1].toUpperCase() === 'ST';
      let weight = parseFloat(averyMatch[2]);
      if (isNaN(weight) || weight < 0) return null; // Disallow negative tare error readings

      const unitRaw = (averyMatch[3] || 'kg').toLowerCase();
      if (unitRaw === 't') {
        weight *= 1000;
      } else if (unitRaw === 'lb' || unitRaw === 'lbs') {
        weight *= LBS_TO_KG;
      }

      return {
        raw: clean,
        weightKg: Math.round(weight * 100) / 100,
        isStable,
        indicatorBrand: 'AVERY',
        unit: 'kg',
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Mettler Toledo SICS: e.g. "S S 12450.0 kg" or "S D 12450.0 kg"
    const mtMatch = clean.match(/^S\s+(S|D)\s+([+-]?\d+(?:\.\d+)?)\s*(kg|g|t|lb|lbs)?/i);
    if (mtMatch) {
      const isStable = mtMatch[1].toUpperCase() === 'S';
      let weight = parseFloat(mtMatch[2]);
      if (isNaN(weight) || weight < 0) return null;

      const unitRaw = (mtMatch[3] || 'kg').toLowerCase();
      if (unitRaw === 't') {
        weight *= 1000;
      } else if (unitRaw === 'g') {
        weight /= 1000;
      } else if (unitRaw === 'lb' || unitRaw === 'lbs') {
        weight *= LBS_TO_KG;
      }

      return {
        raw: clean,
        weightKg: Math.round(weight * 100) / 100,
        isStable,
        indicatorBrand: 'METTLER_TOLEDO',
        unit: 'kg',
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Essae-Teraoka DS series: e.g. "WN 012450 kg" or "WN012450"
    const essaeMatch = clean.match(/^WN\s*([+-]?\d+(?:\.\d+)?)\s*(kg|t)?/i);
    if (essaeMatch) {
      let weight = parseFloat(essaeMatch[1]);
      if (isNaN(weight) || weight < 0) return null;

      const unitRaw = (essaeMatch[2] || 'kg').toLowerCase();
      if (unitRaw === 't') {
        weight *= 1000;
      }

      return {
        raw: clean,
        weightKg: Math.round(weight * 100) / 100,
        isStable: true, // Essae streams WN on stable lock
        indicatorBrand: 'ESSAE',
        unit: 'kg',
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Generic ASCII decimal extractor (strictly positive number with optional kg/t unit)
    // Avoid matching random numbers in unformatted strings or error messages
    const genericMatch = clean.match(/^([+]?\d+(?:\.\d+)?)\s*(?:kg)?$/i);
    if (genericMatch) {
      const weight = parseFloat(genericMatch[1]);
      if (!isNaN(weight) && weight > 0) {
        return {
          raw: clean,
          weightKg: Math.round(weight * 100) / 100,
          isStable: true,
          indicatorBrand: 'GENERIC_ASCII',
          unit: 'kg',
          timestamp: new Date().toISOString(),
        };
      }
    }

    return null;
  }

  /**
   * Parse a raw serial string buffer from a Moisture Meter (MCU-5, KETT, Delmhorst)
   */
  static parseMoistureFrame(rawFrame: string): ParsedMoistureReading | null {
    const clean = rawFrame.trim();
    if (!clean) return null;

    // Reject error frames
    if (/\b(ERR|ERROR|FAULT)\b/i.test(clean)) return null;

    // Matches formats like "M: 7.8%", "MOIST=8.2%", "7.8 %MC"
    const match = clean.match(/(?:M[:=]|MOIST[:=]|MC[:=])?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%/i);
    if (match) {
      const moisture = parseFloat(match[1]);
      if (isNaN(moisture) || moisture < 0 || moisture > 50) return null;
      return {
        raw: clean,
        moisturePercent: Math.round(moisture * 100) / 100,
        isStable: true,
        meterBrand: clean.includes('KETT') ? 'KETT' : clean.includes('MCU') ? 'MCU5' : 'GENERIC',
        timestamp: new Date().toISOString(),
      };
    }

    // Direct decimal (between 3.0% and 25.0% cotton moisture range)
    const directNum = parseFloat(clean);
    if (!isNaN(directNum) && directNum >= 3.0 && directNum <= 25.0) {
      return {
        raw: clean,
        moisturePercent: Math.round(directNum * 100) / 100,
        isStable: true,
        meterBrand: 'GENERIC',
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }
}
