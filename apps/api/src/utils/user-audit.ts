import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
export const USER_AUDIT_ROOT = '0'.repeat(64);
export interface UserAuditPayload {
  eventId:string;actorId:number|null;actorPublicId:string|null;actorUsername:string;
  subjectUserId:number|null;subjectPublicId:string|null;action:string;module:string;details:string;previousHash:string;createdAt:Date|string;
}
export function userAuditHash(row:UserAuditPayload) {
  return createHash('sha256').update(JSON.stringify({version:1,eventId:row.eventId,actorId:row.actorId,actorPublicId:row.actorPublicId,actorUsername:row.actorUsername,subjectUserId:row.subjectUserId,subjectPublicId:row.subjectPublicId,action:row.action,module:row.module,details:row.details,previousHash:row.previousHash,createdAt:new Date(row.createdAt).toISOString()})).digest('hex');
}
/** Call only with the transaction that performed the account mutation. */
export async function appendUserAudit(tx:Prisma.TransactionClient,args:{data:{username:string;action:string;module:string;details:string}},subjectId?:number) {
  const actor=await tx.user.findUnique({where:{username:args.data.username},select:{id:true,publicId:true}});
  const found=args.data.details.match(/(?:Updated user|Created user|Revoked sessions for user|User|from user) (\d+)\b/);
  const targetId=subjectId||(found?Number(found[1]):null);
  const target=targetId?await tx.user.findUnique({where:{id:targetId},select:{id:true,publicId:true}}):null;
  const previous=await tx.userAuditLedger.findFirst({orderBy:{id:'desc'},select:{hash:true}});
  const event:UserAuditPayload={eventId:randomUUID(),actorId:actor?.id||null,actorPublicId:actor?.publicId||null,actorUsername:args.data.username,subjectUserId:target?.id||null,subjectPublicId:target?.publicId||null,action:args.data.action,module:args.data.module,details:args.data.details,previousHash:previous?.hash||USER_AUDIT_ROOT,createdAt:new Date()};
  await tx.userAuditLedger.create({data:{...event,createdAt:new Date(event.createdAt),hash:userAuditHash(event)}});
  return tx.activityLog.create({...args,data:{...args.data,createdAt:new Date(event.createdAt)}});
}
