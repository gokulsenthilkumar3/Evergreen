import { describe, expect, it } from 'vitest';
import {
  calculateHaversineDistance,
  isWithinGeoFence,
  verifyGeoLocation,
  type GeoCoordinate,
  type GeoFence,
} from '@evergreen/types';

describe('Geo & Geofencing verification', () => {
  // Center: Mill / Warehouse Hub in Coimbatore, Tamil Nadu
  const millHub: GeoCoordinate = {
    latitude: 11.0168,
    longitude: 76.9558,
  };

  const millFence: GeoFence = {
    label: 'Main Mill Weighbridge & Loading Dock',
    center: millHub,
    radiusMeters: 200, // 200m perimeter
  };

  it('calculates zero distance for identical coordinates', () => {
    const dist = calculateHaversineDistance(millHub, millHub);
    expect(dist).toBe(0);
  });

  it('calculates accurate distance between known coordinates', () => {
    // Coordinate ~110m away
    const truckLocation: GeoCoordinate = {
      latitude: 11.0176,
      longitude: 76.9564,
    };
    const dist = calculateHaversineDistance(millHub, truckLocation);
    expect(dist).toBeGreaterThan(50);
    expect(dist).toBeLessThan(150);
  });

  it('validates coordinates inside geofence', () => {
    const insideTruck: GeoCoordinate = {
      latitude: 11.0170,
      longitude: 76.9560,
    };
    expect(isWithinGeoFence(insideTruck, millFence)).toBe(true);
  });

  it('rejects coordinates outside geofence', () => {
    // 5 km away in city center
    const farTruck: GeoCoordinate = {
      latitude: 11.0500,
      longitude: 76.9800,
    };
    expect(isWithinGeoFence(farTruck, millFence)).toBe(false);
  });

  it('rejects invalid or non-finite GPS coordinates', () => {
    expect(() =>
      calculateHaversineDistance(
        { latitude: NaN, longitude: 76.9558 },
        millHub,
      ),
    ).toThrow();
    expect(() =>
      calculateHaversineDistance(
        { latitude: 95, longitude: 76.9558 },
        millHub,
      ),
    ).toThrow();
  });

  it('verifies tamper-free dispatch at weighbridge', () => {
    const now = Date.now();
    const validCheckin: GeoCoordinate = {
      latitude: 11.0169,
      longitude: 76.9559,
      accuracyMeters: 15,
      timestamp: now - 10000, // 10 seconds ago
    };

    const result = verifyGeoLocation(validCheckin, millFence, {
      referenceTimestampMs: now,
      maxAcceptableAccuracyMeters: 50,
      maxTimestampAgeMs: 60000,
    });

    expect(result.isWithinFence).toBe(true);
    expect(result.tamperFlags).toHaveLength(0);
    expect(result.distanceMeters).toBeLessThan(millFence.radiusMeters);
  });

  it('detects spoofing or poor sensor accuracy', () => {
    const now = Date.now();
    const poorGps: GeoCoordinate = {
      latitude: 11.0169,
      longitude: 76.9559,
      accuracyMeters: 500, // 500m uncertainty!
      timestamp: now,
    };

    const result = verifyGeoLocation(poorGps, millFence, {
      referenceTimestampMs: now,
      maxAcceptableAccuracyMeters: 100,
    });

    expect(result.isWithinFence).toBe(false);
    expect(result.tamperFlags.some((f) => f.includes('POOR_ACCURACY'))).toBe(true);
  });

  it('flags stale or manipulated timestamps (replay attack prevention)', () => {
    const now = Date.now();
    const replayedCoord: GeoCoordinate = {
      latitude: 11.0169,
      longitude: 76.9559,
      accuracyMeters: 20,
      timestamp: now - 3600000, // 1 hour old!
    };

    const result = verifyGeoLocation(replayedCoord, millFence, {
      referenceTimestampMs: now,
      maxTimestampAgeMs: 120000, // max 2 min
    });

    expect(result.isWithinFence).toBe(false);
    expect(result.tamperFlags.some((f) => f.includes('TIMESTAMP_SKEW'))).toBe(true);
  });
});
