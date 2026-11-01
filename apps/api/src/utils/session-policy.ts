export const DEFAULT_SESSION_POLICY = { absoluteMinutes:1440,idleMinutes:0,maxConcurrent:10,limitAction:'REVOKE_OLDEST' } as const;
export function sessionExpired(session:{createdAt:Date;lastActive:Date;lastSeenAt?:Date|null;expiresAt?:Date|null},policy:{absoluteMinutes:number;idleMinutes:number},now=Date.now()) {
  return Boolean(session.expiresAt&&session.expiresAt.getTime()<=now)||now-session.createdAt.getTime()>=policy.absoluteMinutes*60000||policy.idleMinutes>0&&now-(session.lastSeenAt||session.lastActive).getTime()>=policy.idleMinutes*60000;
}
