import { compareVersions, formatVersion, incrementVersion, parseStableVersion } from './semver';

describe('release version increments', () => {
  it('increments patch, minor and major versions', () => {
    const current = parseStableVersion('v1.4.2');
    expect(formatVersion(incrementVersion(current, 'patch'))).toBe('v1.4.3');
    expect(formatVersion(incrementVersion(current, 'minor'))).toBe('v1.5.0');
    expect(formatVersion(incrementVersion(current, 'major'))).toBe('v2.0.0');
  });

  it('starts at 0.1.0 when no stable release exists', () => {
    expect(formatVersion(incrementVersion(null, 'patch'))).toBe('v0.1.0');
  });

  it('rejects non-stable versions and compares stable tags', () => {
    expect(parseStableVersion('feature-preview')).toBeNull();
    expect(compareVersions(parseStableVersion('v1.5.0')!, parseStableVersion('v1.4.9')!)).toBeGreaterThan(0);
  });
});
