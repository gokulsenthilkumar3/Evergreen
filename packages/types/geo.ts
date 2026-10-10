/**
 * Foolproof Geolocation and Geofencing primitives for field operations,
 * rural collection hubs, weighbridge check-ins, and dispatch verification.
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  timestamp?: number;
}

export interface GeoFence {
  id?: string;
  label?: string;
  center: GeoCoordinate;
  radiusMeters: number;
}

export interface GeoVerificationRecord {
  deviceCoordinate: GeoCoordinate;
  targetFence: GeoFence;
  isWithinFence: boolean;
  distanceMeters: number;
  verifiedAt: string;
  tamperFlags: string[];
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates Great-Circle distance between two coordinates using the Haversine formula.
 * Returns distance in meters rounded to 2 decimal places.
 */
export function calculateHaversineDistance(
  coord1: GeoCoordinate,
  coord2: GeoCoordinate,
): number {
  if (
    !Number.isFinite(coord1.latitude) ||
    !Number.isFinite(coord1.longitude) ||
    !Number.isFinite(coord2.latitude) ||
    !Number.isFinite(coord2.longitude)
  ) {
    throw new Error('Invalid GPS coordinates: latitude and longitude must be finite numbers');
  }

  if (
    coord1.latitude < -90 ||
    coord1.latitude > 90 ||
    coord2.latitude < -90 ||
    coord2.latitude > 90 ||
    coord1.longitude < -180 ||
    coord1.longitude > 180 ||
    coord2.longitude < -180 ||
    coord2.longitude > 180
  ) {
    throw new Error('GPS coordinates out of valid range (-90..90 lat, -180..180 lon)');
  }

  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c * 100) / 100;
}

/**
 * Checks if a coordinate is within a specified geofence, including accuracy tolerance.
 */
export function isWithinGeoFence(
  coord: GeoCoordinate,
  fence: GeoFence,
  toleranceMeters: number = 0,
): boolean {
  const distance = calculateHaversineDistance(coord, fence.center);
  const effectiveRadius = fence.radiusMeters + Math.max(0, toleranceMeters);
  return distance <= effectiveRadius;
}

/**
 * Foolproof dispatch / collection verification.
 * Evaluates geofence match, sensor accuracy threshold, and timestamp skew.
 */
export function verifyGeoLocation(
  deviceCoord: GeoCoordinate,
  targetFence: GeoFence,
  options?: {
    maxAcceptableAccuracyMeters?: number;
    maxTimestampAgeMs?: number;
    referenceTimestampMs?: number;
  },
): GeoVerificationRecord {
  const maxAccuracy = options?.maxAcceptableAccuracyMeters ?? 150;
  const maxAge = options?.maxTimestampAgeMs ?? 300000; // 5 minutes
  const refTime = options?.referenceTimestampMs ?? Date.now();

  const tamperFlags: string[] = [];

  if (deviceCoord.accuracyMeters !== undefined && deviceCoord.accuracyMeters > maxAccuracy) {
    tamperFlags.push(`POOR_ACCURACY_${Math.round(deviceCoord.accuracyMeters)}M`);
  }

  if (deviceCoord.timestamp !== undefined) {
    const age = Math.abs(refTime - deviceCoord.timestamp);
    if (age > maxAge) {
      tamperFlags.push(`TIMESTAMP_SKEW_${Math.round(age / 1000)}S`);
    }
  }

  const distance = calculateHaversineDistance(deviceCoord, targetFence.center);
  const isWithin = distance <= targetFence.radiusMeters;

  if (!isWithin) {
    tamperFlags.push(`OUTSIDE_FENCE_BY_${Math.round(distance - targetFence.radiusMeters)}M`);
  }

  return {
    deviceCoordinate: deviceCoord,
    targetFence,
    isWithinFence: isWithin && tamperFlags.length === 0,
    distanceMeters: distance,
    verifiedAt: new Date(refTime).toISOString(),
    tamperFlags,
  };
}
