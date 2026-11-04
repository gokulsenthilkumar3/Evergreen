import { isIP } from 'node:net';

/** Trust only explicitly named proxy addresses/subnets; never a client-controlled hop count. */
export function trustedProxies(value = process.env.EVERGREEN_TRUSTED_PROXIES): string[] {
  const ranges = (value || 'loopback').split(',').map(part => part.trim()).filter(Boolean);
  for (const range of ranges) {
    if (range === 'loopback') continue;
    const [address, prefix, extra] = range.split('/');
    const family = isIP(address);
    if (!family || extra !== undefined || (prefix !== undefined &&
      (!/^\d+$/.test(prefix) || Number(prefix) < 0 || Number(prefix) > (family === 4 ? 32 : 128)))) {
      throw new Error('EVERGREEN_TRUSTED_PROXIES must contain explicit IP addresses/CIDRs or loopback');
    }
    if (prefix !== undefined && Number(prefix) === 0) throw new Error('Refusing to trust every client address');
  }
  if (!ranges.length) throw new Error('Configure at least one trusted proxy address');
  return ranges;
}
