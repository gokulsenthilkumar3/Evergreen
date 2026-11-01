import { appendUserAudit } from '../../utils/user-audit';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  OnModuleInit,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import { TOTP, generateURI } from 'otplib';
import { omit } from '../../utils/omit';
import { hashPassword, verifyPassword } from './passwords';
import { createHash } from 'node:crypto';
import { DEFAULT_SESSION_POLICY } from '../../utils/session-policy';
const authenticator = new TOTP();


@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
  try {
    if (await this.prisma.user.count() !== 0) return;
    const username=this.configService.get<string>('BOOTSTRAP_ADMIN_USERNAME');
    const password=this.configService.get<string>('BOOTSTRAP_ADMIN_PASSWORD');
    const email=this.configService.get<string>('BOOTSTRAP_ADMIN_EMAIL');
    if (!username||!password||!email) { this.logger.warn('Configure the one-time bootstrap administrator before first use.'); return; }
    const hashedPassword=await hashPassword(password);
    await this.prisma.$transaction(async tx=>{
      const user=await tx.user.create({data:{username,email,password:hashedPassword,name:'System Admin',role:'ADMIN',status:'ACTIVE'}});
      await appendUserAudit(tx,{data:{username,action:'BOOTSTRAP_ADMIN',module:'USER_MANAGEMENT',details:'Created user '+user.id+' (ADMIN): owner-controlled bootstrap'}},user.id);
    });
    this.logger.warn('One-time administrator created. Remove bootstrap variables now.');
  } catch { this.logger.error('Administrator bootstrap failed; no unaudited account was created.'); }
}

  

  async signup(_data: Pick<User, 'username' | 'email' | 'name' | 'password'>) { throw new ForbiddenException('Public staff signup is disabled; use an administrator invitation'); }

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    let user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.status !== 'ACTIVE' || user.lockedUntil && user.lockedUntil > new Date()) return null;

    // Support both bcrypt hashes and legacy plain-text passwords (for migration)
    const passwordMatch = await verifyPassword(user.password, pass);
    if (passwordMatch && !user.password.startsWith('$argon2id$')) {
      const old=user;const password=await hashPassword(pass,false);
      user=await this.prisma.$transaction(async tx=>{
        const changed=await tx.user.updateMany({where:{id:old.id,status:'ACTIVE',password:old.password},data:{password}});
        if(changed.count!==1)throw new UnauthorizedException('Credentials changed; retry sign-in');
        await appendUserAudit(tx,{data:{username:old.username,action:'PASSWORD_REHASH',module:'AUTH',details:'Updated user '+old.id+': upgraded verified legacy password hash'}},old.id);
        return tx.user.findUniqueOrThrow({where:{id:old.id}});
      });
    }
    if (passwordMatch) {
      return omit(user, ['password']);
    }
    await this.recordFailedLogin(user.id, user.username);
    return null;
  }

  private async recordFailedLogin(id: number, username: string) {
    await this.prisma.$transaction(async tx => {
      const updated = await tx.user.update({ where: { id }, data: { failedLogins: { increment: 1 } }, select: { failedLogins: true } });
      if (updated.failedLogins >= 5) await tx.user.update({ where: { id }, data: { lockedUntil: new Date(Date.now() + Math.min(60, 2 ** Math.min(6, updated.failedLogins - 5)) * 60000) } });
      await appendUserAudit(tx, { data: { username, action: 'AUTH_FAILED', module: 'AUTH', details: `Updated user ${id}: failed authentication` } });
    });
  }

  async login(
    user: Omit<User, 'password'>,
    requestInfo?: { ip?: string; userAgent?: string; device?: string },
    totpCode?: string,
    recoveryCode?: string,
    verifiedPasskey = false,
  ) {
    if (user.status !== 'ACTIVE' || user.lockedUntil && user.lockedUntil > new Date()) throw new UnauthorizedException('Account is not active');
    let recoveryId: string | undefined;
    // If TOTP is enabled, verify it
    if (user.isTotpEnabled && !verifiedPasskey) {
      if (!totpCode && !recoveryCode) {
        // Return a special error indicating TOTP is required
        throw new UnauthorizedException({
          message: 'TOTP_REQUIRED',
          error: 'Unauthorized',
        });
      }

      const isValid = totpCode && user.totpSecret ? await authenticator.verify(totpCode, { secret: user.totpSecret }) : { valid: false };
      if (!isValid.valid && recoveryCode) {
        const backup = await this.prisma.userRecoveryCode.findUnique({ where: { codeHash: createHash('sha256').update(recoveryCode.replaceAll('-', '').toUpperCase()).digest('hex') } });
        if (backup && backup.userId === user.id && !backup.usedAt) recoveryId = backup.id;
      }
      if (!isValid.valid && !recoveryId) {
        await this.recordFailedLogin(user.id, user.username);
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    let location = 'Unknown Location';
    const ip = requestInfo?.ip || 'Unknown';

    if (ip === '::1' || ip === '127.0.0.1' || ip === 'Unknown') {
      location = 'Local Development';
    } else {
      try {
        // Use HTTPS and a 3-second timeout for geolocation
        const endpoint = this.configService.get<string>('GEOLOCATION_URL')!;
        const url = new URL(endpoint.replace('{ip}', encodeURIComponent(ip)));
        if (url.protocol !== 'https:')
          throw new Error('Geolocation requires HTTPS');
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error('Geolocation provider rejected request');
        const data = await res.json();
        if (data.status === 'success') {
          location = `${data.city}, ${data.country}`;
        }
      } catch {
        // Geolocation is non-critical — silently fall back
        console.warn('Geolocation lookup failed or timed out');
      }
    }

    // Create a new session record
    let absoluteMinutes: number = DEFAULT_SESSION_POLICY.absoluteMinutes;
    const session = await this.prisma.$transaction(async tx => {
      const current = await tx.user.findUnique({ where: { id: user.id } });
      if (!current || current.status !== 'ACTIVE' || current.lockedUntil && current.lockedUntil > new Date() || current.isTotpEnabled !== user.isTotpEnabled || current.totpSecret !== user.totpSecret) throw new UnauthorizedException('Account state changed');
      if (current.updatedAt.getTime() !== user.updatedAt.getTime()) throw new UnauthorizedException('Account changed during sign-in; please retry');
      const policy = await tx.userSessionPolicy.findUnique({ where: { role: current.role } }) || DEFAULT_SESSION_POLICY;
      absoluteMinutes = policy.absoluteMinutes;
      const now = new Date();
      const active = await tx.session.findMany({ where: { userId: user.id, isValid: true, createdAt: { gt: new Date(now.getTime()-policy.absoluteMinutes*60000) }, OR: [{expiresAt:null},{expiresAt:{gt:now}}], ...(policy.idleMinutes>0?{lastActive:{gt:new Date(now.getTime()-policy.idleMinutes*60000)}}:{}) }, orderBy: [{lastActive:'asc'},{id:'asc'}], select: {id:true} });
      if (active.length >= policy.maxConcurrent) {
        if (policy.limitAction === 'REJECT') throw new UnauthorizedException('Concurrent session limit reached; revoke an existing session or use account recovery');
        await tx.session.updateMany({ where: { id: { in: active.slice(0,active.length-policy.maxConcurrent+1).map(item=>item.id) } }, data: { isValid: false } });
      }
      if (recoveryId) {
        const consumed = await tx.userRecoveryCode.updateMany({ where: { id: recoveryId, userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
        if (consumed.count !== 1) throw new UnauthorizedException('Recovery code already used');
      }
      await tx.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
      const created = await tx.session.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        location: location,
        userAgent: requestInfo?.userAgent || 'Unknown',
        device: requestInfo?.device || 'Unknown',
        isValid: true,
        expiresAt: new Date(now.getTime()+policy.absoluteMinutes*60000),
        lastSeenAt: now,
      },
      });
      await appendUserAudit(tx, { data: { username: user.username, action: 'LOGIN', module: 'AUTH', details: `User ${user.id} signed in using ${verifiedPasskey ? 'passkey' : recoveryId ? 'recovery code' : 'password'}` } });
      return created;
    });

    // Fire and forget email notification
    if (user.email) {
      this.emailService
        .sendLoginNotification(
          user.email,
          ip,
          requestInfo?.userAgent || 'Unknown',
          location,
        )
        .catch((e) => console.error(e));
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      sessionId: session.id,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: absoluteMinutes*60 }),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async assertOwnerProof(userId:number,password:string,code?:string) {
    const user=await this.prisma.user.findUnique({where:{id:userId}});
    if(!user||user.status!=='ACTIVE'||user.lockedUntil&&user.lockedUntil>new Date())throw new BadRequestException('Current password is incorrect or the account is locked');
    if(!await verifyPassword(user.password,password)){await this.recordFailedLogin(user.id,user.username);throw new BadRequestException('Current password is incorrect or the account is locked');}
    if(user.isTotpEnabled&&(!code||!user.totpSecret||!(await authenticator.verify(code,{secret:user.totpSecret})).valid)){await this.recordFailedLogin(user.id,user.username);throw new BadRequestException('Authenticator code is required');}
    return user;
  }

  async generateTotpSecret(userId:number,email:string) {
  const secret=authenticator.generateSecret();
  const otpauth=generateURI({issuer:this.configService.get<string>('TOTP_ISSUER')||'EverGreen',label:email,secret});
  await this.prisma.$transaction(async tx=>{
    const user=await tx.user.findUnique({where:{id:userId}});
    if(!user||user.status!=='ACTIVE'||user.isTotpEnabled)throw new BadRequestException('Disable existing two-factor authentication before setting it up again');
    await tx.user.update({where:{id:userId},data:{totpSecret:secret}});
    await appendUserAudit(tx,{data:{username:user.username,action:'MFA_SETUP_STARTED',module:'AUTH',details:'Updated user '+userId+': started authenticator enrollment'}},userId);
  });
  return {secret,otpauth};
}

  async verifyAndEnableTotp(userId:number,code:string,currentSessionId?:string) {
  const user=await this.prisma.user.findUnique({where:{id:userId}});
  if(!user||user.status!=='ACTIVE'||!user.totpSecret)throw new BadRequestException('TOTP not setup');
  if(!(await authenticator.verify(code,{secret:user.totpSecret})).valid)throw new BadRequestException('Invalid authentication code');
  await this.prisma.$transaction(async tx=>{
    const changed=await tx.user.updateMany({where:{id:userId,status:'ACTIVE',totpSecret:user.totpSecret,isTotpEnabled:false},data:{isTotpEnabled:true}});
    if(changed.count!==1)throw new BadRequestException('Authenticator state changed; reload before retrying');
    await tx.session.updateMany({where:{userId,isValid:true,...(currentSessionId?{id:{not:currentSessionId}}:{})},data:{isValid:false}});
    await appendUserAudit(tx,{data:{username:user.username,action:'MFA_ENABLED',module:'AUTH',details:'Updated user '+userId+': enabled authenticator; other sessions revoked'}},userId);
  });
  return {success:true};
}

  async disableTotp(userId:number,code:string,currentSessionId?:string) {
  const user=await this.prisma.user.findUnique({where:{id:userId}});
  if(!user||user.status!=='ACTIVE'||!user.isTotpEnabled||!user.totpSecret||!/^\d{6}$/.test(code))throw new BadRequestException('A valid current authentication code is required');
  if(!(await authenticator.verify(code,{secret:user.totpSecret})).valid)throw new BadRequestException('Invalid authentication code');
  await this.prisma.$transaction(async tx=>{
    const changed=await tx.user.updateMany({where:{id:userId,status:'ACTIVE',totpSecret:user.totpSecret,isTotpEnabled:true},data:{isTotpEnabled:false,totpSecret:null}});
    if(changed.count!==1)throw new BadRequestException('Authenticator state changed; retry');
    await tx.session.updateMany({where:{userId,isValid:true,...(currentSessionId?{id:{not:currentSessionId}}:{})},data:{isValid:false}});
    await appendUserAudit(tx,{data:{username:user.username,action:'MFA_DISABLED',module:'AUTH',details:'Updated user '+userId+': disabled authenticator; other sessions revoked'}},userId);
  });
  return {success:true};
}

  async updateProfile(userId:number,username:string,data:{name?:string;email?:string}) {
  return this.prisma.$transaction(async tx=>{
    const current=await tx.user.findUnique({where:{id:userId}});
    if(!current||current.status!=='ACTIVE')throw new UnauthorizedException('Account is not active');
    if(data.email!==undefined&&data.email.trim()!==current.email)throw new BadRequestException('Email changes require mailbox verification in Security Settings');
    const updated=await tx.user.update({where:{id:userId},data:{...(data.name!==undefined?{name:data.name.trim()}:{}),updatedBy:username},select:{id:true,publicId:true,username:true,name:true,email:true,role:true,isTotpEnabled:true}});
    await appendUserAudit(tx,{data:{username,action:'PROFILE_UPDATE',module:'USER_MANAGEMENT',details:'Updated user '+userId+': personal profile'}},userId);
    return updated;
  });
}

  /**
   * Change the caller's password and sign out every other session, so a session opened with the
   * old password (for example by someone who learned it) stops working. The current session stays.
   */
  async changePassword(userId:number,username:string,data:{currentPassword:string;newPassword:string},currentSessionId?:string) {
  const user=await this.prisma.user.findUnique({where:{id:userId}});
  if(!user||user.status!=='ACTIVE')throw new UnauthorizedException('Account is not active');
  if(!await verifyPassword(user.password,data.currentPassword))throw new BadRequestException('Current password is incorrect');
  if(data.newPassword===data.currentPassword)throw new BadRequestException('New password must be different from current password');
  const password=await hashPassword(data.newPassword);
  return this.prisma.$transaction(async tx=>{
    const changed=await tx.user.updateMany({where:{id:userId,status:'ACTIVE',password:user.password},data:{password,updatedBy:username}});
    if(changed.count!==1)throw new BadRequestException('Account credentials changed; retry');
    const revoked=await tx.session.updateMany({where:{userId,isValid:true,...(currentSessionId?{id:{not:currentSessionId}}:{})},data:{isValid:false}});
    await appendUserAudit(tx,{data:{username,action:'PASSWORD_CHANGE',module:'AUTH',details:'Updated user '+userId+': password changed; '+revoked.count+' other sessions revoked'}},userId);
    return {success:true,message:'Password changed successfully',signedOutSessions:revoked.count};
  });
}
}
