import { sessionExpired } from './session-policy';
describe('Session policy expiry',()=>{
  const now=Date.parse('2026-11-01T12:00:00Z');
  const session={createdAt:new Date(now-3600000),lastActive:new Date(now-300000),lastSeenAt:new Date(now-300000),expiresAt:new Date(now+3600000)};
  it('enforces current absolute lifetime even for an older longer-lived token',()=>{expect(sessionExpired(session,{absoluteMinutes:30,idleMinutes:0},now)).toBe(true);});
  it('enforces idle timeout using observed activity rather than revocation metadata',()=>{expect(sessionExpired({...session,lastActive:new Date(now)},{absoluteMinutes:120,idleMinutes:3},now)).toBe(true);});
  it('allows disabling idle expiry and still honours explicit token/session expiry',()=>{
    expect(sessionExpired(session,{absoluteMinutes:120,idleMinutes:0},now)).toBe(false);
    expect(sessionExpired({...session,expiresAt:new Date(now-1)},{absoluteMinutes:120,idleMinutes:0},now)).toBe(true);
  });
});
