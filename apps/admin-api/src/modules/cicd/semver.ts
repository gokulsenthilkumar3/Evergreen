import { BadRequestException } from '@nestjs/common';

export type Increment = 'patch' | 'minor' | 'major';
export type Version = { major: number; minor: number; patch: number };

export function parseStableVersion(value: string | null | undefined): Version | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(value || '').trim());
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function formatVersion(version: Version) {
  return `v${version.major}.${version.minor}.${version.patch}`;
}

export function compareVersions(left: Version, right: Version) {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}

export function incrementVersion(current: Version | null, increment: Increment): Version {
  if (!current) return { major: 0, minor: 1, patch: 0 };
  if (increment === 'major') return { major: current.major + 1, minor: 0, patch: 0 };
  if (increment === 'minor') return { major: current.major, minor: current.minor + 1, patch: 0 };
  return { major: current.major, minor: current.minor, patch: current.patch + 1 };
}

export function requireIncrement(value: string | undefined): Increment {
  if (value === 'major' || value === 'minor' || value === 'patch') return value;
  throw new BadRequestException('Increment must be patch, minor or major');
}
