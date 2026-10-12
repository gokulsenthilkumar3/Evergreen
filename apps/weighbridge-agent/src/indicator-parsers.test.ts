import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { IndicatorProtocolParser } from './indicator-parsers.js';
import { AntiTamperEngine } from './anti-tamper.js';

describe('IndicatorProtocolParser', () => {
  test('correctly parses Avery Weigh-Tronix kg frame', () => {
    const res = IndicatorProtocolParser.parseWeightFrame('ST,GS,+012450kg');
    assert.ok(res);
    assert.equal(res.weightKg, 12450);
    assert.equal(res.isStable, true);
    assert.equal(res.indicatorBrand, 'AVERY');
  });

  test('correctly parses Avery Weigh-Tronix lb frame and converts to kg', () => {
    const res = IndicatorProtocolParser.parseWeightFrame('ST,GS,+001000lb');
    assert.ok(res);
    // 1000 lbs = 453.59 kg
    assert.equal(res.weightKg, 453.59);
    assert.equal(res.isStable, true);
  });

  test('correctly parses Mettler Toledo g frame and converts to kg', () => {
    const res = IndicatorProtocolParser.parseWeightFrame('S S 500000 g');
    assert.ok(res);
    assert.equal(res.weightKg, 500);
    assert.equal(res.isStable, true);
    assert.equal(res.indicatorBrand, 'METTLER_TOLEDO');
  });

  test('rejects negative tare error readings without converting to positive', () => {
    const averyNegative = IndicatorProtocolParser.parseWeightFrame('ST,GS,-00500kg');
    assert.equal(averyNegative, null);

    const mtNegative = IndicatorProtocolParser.parseWeightFrame('S S -100.0 kg');
    assert.equal(mtNegative, null);
  });

  test('rejects hardware error strings instead of extracting numbers', () => {
    const errFrame = IndicatorProtocolParser.parseWeightFrame('ERR 42');
    assert.equal(errFrame, null);

    const errorFrame = IndicatorProtocolParser.parseWeightFrame('ERROR 10');
    assert.equal(errorFrame, null);

    const faultFrame = IndicatorProtocolParser.parseWeightFrame('FAULT');
    assert.equal(faultFrame, null);
  });

  test('correctly parses moisture meter reading', () => {
    const moist = IndicatorProtocolParser.parseMoistureFrame('M: 8.4%');
    assert.ok(moist);
    assert.equal(moist.moisturePercent, 8.4);
    assert.equal(moist.isStable, true);
  });

  for (const frame of ['ST,GS,100oz', 'ST,GS,100kg trailing', 'prefix ST,GS,100kg', 'S S 100xyz', 'S S 100 kg junk', 'WN100oz', 'WN100kg extra', `ST,GS,${'9'.repeat(400)}kg`, `${'9'.repeat(400)}kg`]) {
    test(`rejects malformed weight frame ${frame.slice(0, 50)}`, () => {
      assert.equal(IndicatorProtocolParser.parseWeightFrame(frame), null);
    });
  }

  for (const frame of ['12garbage', '12.2% trailing', '-8.2%', '100%', '108.2%', 'ERR42 8%', 'prefix M: 8.2%', '8.234%']) {
    test(`rejects malformed moisture frame ${frame}`, () => {
      assert.equal(IndicatorProtocolParser.parseMoistureFrame(frame), null);
    });
  }

  test('retains full supported frames, unit conversion and unstable status', () => {
    assert.equal(IndicatorProtocolParser.parseWeightFrame('US,GS,100lbs')?.isStable, false);
    assert.equal(IndicatorProtocolParser.parseWeightFrame('US,GS,100lbs')?.weightKg, 45.36);
    assert.equal(IndicatorProtocolParser.parseWeightFrame('S D 1 t')?.weightKg, 1000);
    assert.equal(IndicatorProtocolParser.parseWeightFrame('WN100kg')?.weightKg, 100);
    assert.equal(IndicatorProtocolParser.parseMoistureFrame('7.8 %MC')?.moisturePercent, 7.8);
    assert.equal(IndicatorProtocolParser.parseMoistureFrame('KETT M: 8.4%')?.meterBrand, 'KETT');
    assert.equal(IndicatorProtocolParser.parseMoistureFrame('12.25')?.moisturePercent, 12.25);
  });
});

describe('AntiTamperEngine', () => {
  test('signs and verifies weighbridge slip', () => {
    const payload = {
      deviceSerial: 'WB-01',
      comPort: 'COM3',
      grossWeightKg: 25000,
      tareWeightKg: 10000,
      moisturePercent: 9.5,
      standardMoistureBase: 8.5,
      timestamp: '2026-10-11T12:00:00.000Z',
    };
    const secret = 'test_secret_key_weighbridge_12345';
    const slip = AntiTamperEngine.signSlip(payload, secret);
    assert.ok(slip.signature);
    assert.equal(slip.calculations.netWeightKg, 15000);
    // 9.5 - 8.5 = 1.0% excess => 1% of 15000 = 150 kg deduction
    assert.equal(slip.calculations.moistureDeductionKg, 150);
    assert.equal(slip.calculations.finalBillableKg, 14850);

    // Verification passes
    assert.equal(AntiTamperEngine.verifySlip(slip, secret), true);

    // Tampered final billable kg fails verification
    const tampered = {
      ...slip,
      calculations: { ...slip.calculations, finalBillableKg: 14950 },
    };
    assert.equal(AntiTamperEngine.verifySlip(tampered, secret), false);
  });
});
