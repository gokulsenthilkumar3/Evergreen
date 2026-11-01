import { appendUserAudit } from '../../utils/user-audit';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { TOTP, generateURI } from 'otplib';
import { PrismaService } from '../../services/prisma.service';
import { EmailService } from './email.service';
import { hashPassword, verifyPassword } from './passwords';
import { InviteAccountDto, RedeemAccountDto } from './account-flows.dto';

const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const authenticator = new TOTP();
@Injectable()
export class AccountFlowsService {
  constructor(private readonly prisma: PrismaService, private readonly mail: EmailService, private readonly config: ConfigService) {}
  private origin() {
    const configured = this.config.get<string>('PUBLIC_APP_URL');
    if (!configured && process.env.NODE_ENV === 'production') throw new ServiceUnavailableException('PUBLIC_APP_URL is required');
    const url = new URL(configured || 'http://localhost:4000');
    if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname)))) throw new ServiceUnavailableException('Invalid application URL');
    url.hash = ''; url.search = ''; return url;
  }
  senders() { return this.mail.readiness(); }
  verifySender(name: string) { if (name !== 'primary' && name !== 'secondary') throw new BadRequestException('Unknown SMTP sender'); return this.mail.verifyAccount(name); }
  private async deliver(userId: number, email: string, purpose: 'INVITE' | 'RESET_PASSWORD' | 'VERIFY_EMAIL', actor: string, sender: 'primary' | 'secondary' = 'primary') {
    if (!this.mail.readiness().some(account => account.name === sender && account.configured)) throw new ServiceUnavailableException('SMTP sender is not configured');
    const token = randomBytes(32).toString('hex');
    const url = this.origin();
    url.hash = new URLSearchParams({ 'account-action': purpose, token }).toString();
    const inviteHours = Math.min(168, Math.max(1, Number(this.config.get('INVITE_TTL_HOURS') || 24)));
    const expiresAt = new Date(Date.now() + (purpose === 'RESET_PASSWORD' ? 15 * 60000 : purpose === 'INVITE' ? inviteHours * 3600000 : 24 * 3600000));
    const row = await this.prisma.$transaction(async tx => {
      await tx.accountActionToken.updateMany({ where: { userId, purpose, usedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
      const result = await tx.accountActionToken.create({ data: { tokenHash: digest(token), userId, email, purpose, expiresAt, createdBy: actor } });
      await appendUserAudit(tx, { data: { username: actor, action: 'ACCOUNT_LINK_CREATED', module: 'USER_MANAGEMENT', details: `Updated user ${userId}: ${purpose} link recorded` } });
      return result;
    });
    try {
      const receipt = await this.mail.sendAccountMessage(email, purpose === 'INVITE' ? 'Your EverGreen invitation' : purpose === 'RESET_PASSWORD' ? 'Reset your EverGreen password' : 'Verify your EverGreen email', `Use this single-use link before ${expiresAt.toISOString()}:\n${url.toString()}\nIf you did not request this, ignore this message. Never share this link.`, sender);
      await this.prisma.accountActionToken.update({ where: { id: row.id }, data: { deliveryStatus: 'ACCEPTED', messageId: receipt.messageId } });
      return { id: row.id, expiresAt, deliveryStatus: 'ACCEPTED' };
    } catch {
      await this.prisma.accountActionToken.update({ where: { id: row.id }, data: { revokedAt: new Date(), deliveryStatus: 'FAILED' } });
      throw new ServiceUnavailableException('Email delivery failed; the link has been revoked');
    }
  }
  async invite(input: InviteAccountDto, actor: string) {
    if (!this.mail.readiness().some(item => item.name === (input.sender || 'primary') && item.configured)) throw new ServiceUnavailableException('SMTP sender is not configured');
    this.origin();
    const password = await hashPassword(randomBytes(32).toString('hex'));
    const user = await this.prisma.$transaction(async tx => {
      const existing = await tx.user.findFirst({ where: { OR: [{ username: input.username }, { email: input.email }] } });
      if (existing) {
        if (existing.status === 'PENDING' && existing.username === input.username && existing.email === input.email && existing.role === input.role) return existing;
        throw new BadRequestException('Username or email already exists');
      }
      const settings = await tx.systemSettings.findFirst({ select: { maxUsers: true } });
      if (settings && await tx.user.count({ where: { status: { not: 'DELETED' } } }) >= settings.maxUsers) throw new BadRequestException('User licence quota reached');
      const created = await tx.user.create({ data: { username: input.username, email: input.email, name: input.name, role: input.role, status: 'PENDING', password, createdBy: actor } });
      await appendUserAudit(tx, { data: { username: actor, action: 'INVITE_ACCOUNT', module: 'USER_MANAGEMENT', details: `Created user ${created.id} (${created.role}): pending MFA enrollment` } });
      return created;
    });
    return this.deliver(user.id, input.email, 'INVITE', actor, input.sender);
  }
  async requestReset(email: string, sender?: 'primary' | 'secondary') {
    // The public response never reveals whether this email belongs to an account.
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user?.status === 'ACTIVE') {
      try { await this.deliver(user.id, email, 'RESET_PASSWORD', 'account-recovery', sender); }
      catch { /* Delivery state is recorded; never expose account existence. */ }
    }
    return { message: 'If an eligible account exists, a recovery email will be sent.' };
  }
  private async readToken(raw: string, purpose?: string) {
    const row = await this.prisma.accountActionToken.findUnique({ where: { tokenHash: digest(raw) }, include: { user: true } });
    if (!row || (purpose && row.purpose !== purpose) || row.usedAt || row.revokedAt || row.expiresAt <= new Date() || row.deliveryStatus !== 'ACCEPTED') throw new BadRequestException('Account link is invalid or expired');
    return row;
  }
  async startOnboarding(raw: string) {
    const token = await this.readToken(raw, 'INVITE');
    if (token.user.status !== 'PENDING') throw new BadRequestException('Account is not pending onboarding');
    if (!token.user.totpSecret) await this.prisma.user.updateMany({ where: { id: token.userId, status: 'PENDING', totpSecret: null }, data: { totpSecret: authenticator.generateSecret() } });
    const current = await this.prisma.user.findUnique({ where: { id: token.userId }, select: { totpSecret: true } });
    const secret = current?.totpSecret;
    if (!secret) throw new BadRequestException('Onboarding state changed');
    return { username: token.user.username, otpauth: generateURI({ issuer: 'EverGreen', label: token.email, secret }) };
  }
  async redeem(input: RedeemAccountDto) {
    const token = await this.readToken(input.token);
    if (token.purpose === 'INVITE' && token.user.status !== 'PENDING' || token.purpose === 'RESET_PASSWORD' && token.user.status !== 'ACTIVE' || token.user.status === 'DELETED') throw new BadRequestException('Account is not eligible');
    const needsMfa = token.purpose === 'INVITE' || token.user.isTotpEnabled;
    let recoveryId: string | undefined;
    if (needsMfa) {
      const valid = input.code && token.user.totpSecret ? (await authenticator.verify(input.code, { secret: token.user.totpSecret })).valid : false;
      if (!valid && input.recoveryCode && token.purpose !== 'INVITE') {
        const backup = await this.prisma.userRecoveryCode.findUnique({ where: { codeHash: digest(input.recoveryCode.replaceAll('-', '').toUpperCase()) } });
        if (backup && backup.userId === token.userId && !backup.usedAt) recoveryId = backup.id;
      }
      if (!valid && !recoveryId) throw new UnauthorizedException('A valid authenticator or recovery code is required');
    }
    const password = token.purpose === 'VERIFY_EMAIL' ? undefined : await hashPassword(input.password || '');
    return this.prisma.$transaction(async tx => {
      const current = await tx.user.findUnique({ where: { id: token.userId } });
      if (!current || current.status !== token.user.status || current.email !== token.user.email || current.totpSecret !== token.user.totpSecret) throw new BadRequestException('Account state changed');
      const consumed = await tx.accountActionToken.updateMany({ where: { id: token.id, usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
      if (consumed.count !== 1) throw new BadRequestException('Account link was already used');
      await tx.accountActionToken.updateMany({ where: { userId: token.userId, id: { not: token.id }, usedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
      if (recoveryId) {
        const used = await tx.userRecoveryCode.updateMany({ where: { id: recoveryId, usedAt: null }, data: { usedAt: new Date() } });
        if (used.count !== 1) throw new BadRequestException('Recovery code was already used');
      }
      await tx.user.update({ where: { id: token.userId }, data: { ...(password ? { password } : {}), ...(token.purpose === 'INVITE' ? { status: 'ACTIVE', isTotpEnabled: true, emailVerifiedAt: new Date() } : {}), ...(token.purpose === 'VERIFY_EMAIL' ? { email: token.email, emailVerifiedAt: new Date() } : {}), failedLogins: 0, lockedUntil: null } });
      await tx.session.updateMany({ where: { userId: token.userId, isValid: true }, data: { isValid: false } });
      await appendUserAudit(tx, { data: { username: current.username, action: 'ACCOUNT_LINK_REDEEMED', module: 'USER_MANAGEMENT', details: `Updated user ${token.userId}: completed ${token.purpose}; sessions revoked` } });
      return { completed: true, purpose: token.purpose };
    });
  }
  async requestEmailChange(userId: number, email: string, password: string, sender?: 'primary' | 'secondary') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !await verifyPassword(user.password, password)) throw new BadRequestException('Current password is incorrect');
    const collision = await this.prisma.user.findUnique({ where: { email } });
    if (collision && collision.id !== userId) throw new BadRequestException('Email already belongs to an account');
    return this.deliver(userId, email, 'VERIFY_EMAIL', user.username, sender);
  }
  async recoveryCodes(userId: number, password: string, code?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !await verifyPassword(user.password, password)) throw new BadRequestException('Current password is incorrect');
    if (user.isTotpEnabled && (!code || !user.totpSecret || !(await authenticator.verify(code, { secret: user.totpSecret })).valid)) throw new BadRequestException('Authenticator code is required');
    const codes = Array.from({ length: 10 }, () => randomBytes(12).toString('hex').toUpperCase());
    await this.prisma.$transaction(async tx => {
      await tx.userRecoveryCode.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
      for (const value of codes) await tx.userRecoveryCode.create({ data: { userId, codeHash: digest(value) } });
      await appendUserAudit(tx, { data: { username: user.username, action: 'RECOVERY_CODES_GENERATED', module: 'USER_MANAGEMENT', details: `Updated user ${userId}: generated 10 single-use recovery codes; previous codes retired` } });
    });
    return { codes: codes.map(value => value.match(/.{1,4}/g)!.join('-')) };
  }
  async invitations() {
    const rows = await this.prisma.accountActionToken.findMany({ where: { purpose: 'INVITE' }, select: { id: true, userId: true, email: true, createdBy: true, createdAt: true, expiresAt: true, usedAt: true, revokedAt: true, deliveryStatus: true, user: { select: { username: true, role: true, status: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
    return rows.map(row => ({ ...row, status: row.usedAt ? 'COMPLETED' : row.deliveryStatus === 'FAILED' ? 'DELIVERY_FAILED' : row.revokedAt ? 'REVOKED' : row.expiresAt <= new Date() ? 'EXPIRED' : row.deliveryStatus === 'ACCEPTED' ? 'DELIVERY_ACCEPTED' : 'PENDING' }));
  }
  async revokeInvitation(id: string, actor: string) {
    await this.prisma.$transaction(async tx => {
      const token = await tx.accountActionToken.findUnique({ where: { id } });
      if (!token || token.purpose !== 'INVITE') throw new NotFoundException('Invitation not found');
      if (token.usedAt) throw new BadRequestException('Invitation already accepted');
      await tx.accountActionToken.update({ where: { id }, data: { revokedAt: new Date() } });
      await appendUserAudit(tx, { data: { username: actor, action: 'INVITE_REVOKED', module: 'USER_MANAGEMENT', details: `Updated user ${token.userId}: invitation revoked` } });
    });
    return { revoked: true };
  }
}
