import { appendUserAudit } from '../../utils/user-audit';
import { BadRequestException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { TOTP } from 'otplib';
import { PrismaService } from '../../services/prisma.service';
import { AuthService } from './auth.service';
import { verifyPassword } from './passwords';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
interface Pending { cookie: string; verifier: string; nonce: string; expires: number; userId?: number; sessionId?: string; updatedAt?: number }
interface Ticket { cookie: string; userId: number; expires: number; attempts: number; busy: boolean }
@Injectable()
export class OidcService {
  private readonly pending = new Map<string, Pending>();
  private readonly tickets = new Map<string, Ticket>();
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService, private readonly auth: AuthService) {}
  status() { return { configured: Boolean(this.config.get('OIDC_ISSUER') && this.config.get('OIDC_CLIENT_ID') && this.config.get('OIDC_CLIENT_SECRET')), label: this.config.get<string>('OIDC_LABEL') || 'Identity provider' }; }
  private urls() {
    const app = new URL(this.config.get<string>('PUBLIC_APP_URL') || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000'));
    if (app.protocol !== 'https:' && !(app.protocol === 'http:' && ['localhost','127.0.0.1'].includes(app.hostname))) throw new ServiceUnavailableException('SSO requires HTTPS or localhost');
    const callback = new URL(this.config.get<string>('OIDC_CALLBACK_URL') || '/api/backend/auth/oidc/callback', app.origin);
    if (callback.origin !== app.origin || callback.hash || callback.search) throw new ServiceUnavailableException('SSO callback must use the application origin');
    return { app, callback };
  }
  private async provider() {
    if (!this.status().configured) throw new ServiceUnavailableException('OIDC is not configured');
    const issuer = new URL(this.config.get<string>('OIDC_ISSUER')!);
    if (issuer.protocol !== 'https:') throw new ServiceUnavailableException('OIDC issuer must use HTTPS');
    const oidc = await import('openid-client');
    const configuration = await oidc.discovery(issuer, this.config.get<string>('OIDC_CLIENT_ID')!, this.config.get<string>('OIDC_CLIENT_SECRET')!);
    return { oidc, configuration };
  }
  private prune() {
    const now = Date.now();
    for (const [key,value] of this.pending) if (value.expires <= now) this.pending.delete(key);
    for (const [key,value] of this.tickets) if (value.expires <= now) this.tickets.delete(key);
  }
  async start(link?: { userId: number; sessionId: string; password: string; code?: string }) {
    this.prune();
    if (this.pending.size >= 1000 || this.tickets.size >= 1000) throw new ServiceUnavailableException('Too many pending SSO requests');
    const { callback } = this.urls();
    let updatedAt: number | undefined;
    if (link) {
      const user = await this.prisma.user.findUnique({ where: { id: link.userId } });
      if (!user || user.status !== 'ACTIVE' || !await verifyPassword(user.password, link.password)) throw new BadRequestException('Current password is incorrect');
      if (user.isTotpEnabled && (!link.code || !user.totpSecret || !(await new TOTP().verify(link.code, { secret: user.totpSecret })).valid)) throw new BadRequestException('Authenticator code is required');
      updatedAt = user.updatedAt.getTime();
    }
    const { oidc, configuration } = await this.provider();
    const verifier = oidc.randomPKCECodeVerifier(), state = oidc.randomState(), nonce = oidc.randomNonce(), cookie = randomBytes(32).toString('hex');
    const url = oidc.buildAuthorizationUrl(configuration, { redirect_uri: callback.toString(), scope: 'openid email profile', response_type: 'code', code_challenge: await oidc.calculatePKCECodeChallenge(verifier), code_challenge_method: 'S256', state, nonce, prompt: 'select_account' });
    this.pending.set(state, { cookie: hash(cookie), verifier, nonce, expires: Date.now()+600000, ...(link ? {userId:link.userId,sessionId:link.sessionId,updatedAt} : {}) });
    return { authorizationUrl: url.toString(), cookie, secure: callback.protocol === 'https:' };
  }
  async callback(query: string, cookie: string) {
    this.prune();
    const { callback, app } = this.urls(); callback.search = query;
    const state = callback.searchParams.get('state') || '', flow = this.pending.get(state);
    if (!flow || flow.cookie !== hash(cookie)) throw new UnauthorizedException('SSO browser state is invalid or expired');
    this.pending.delete(state);
    const { oidc, configuration } = await this.provider();
    const tokens = await oidc.authorizationCodeGrant(configuration, callback, { pkceCodeVerifier: flow.verifier, expectedState: state, expectedNonce: flow.nonce, idTokenExpected: true });
    const claims = tokens.claims();
    if (!claims?.sub || typeof claims.sub !== 'string' || claims.iss !== configuration.serverMetadata().issuer) throw new UnauthorizedException('Invalid OIDC identity');
    const issuer = claims.iss, subject = claims.sub;
    if (flow.userId) {
      await this.prisma.$transaction(async tx => {
        const session = await tx.session.findUnique({ where: { id: flow.sessionId } });
        const user = await tx.user.findUnique({ where: { id: flow.userId } });
        if (!session?.isValid || session.userId !== flow.userId || !user || user.status !== 'ACTIVE' || user.updatedAt.getTime() !== flow.updatedAt) throw new UnauthorizedException('Link authorization expired');
        const existing = await tx.userExternalIdentity.findUnique({ where: { issuer_subject: { issuer, subject } } });
        if (existing && existing.userId !== flow.userId) throw new BadRequestException('External identity is linked to another account');
        if (!existing) await tx.userExternalIdentity.create({ data: { userId: flow.userId!, issuer, subject } });
        await appendUserAudit(tx, { data: { username: user.username, action: 'LINK_IDENTITY', module: 'USER_MANAGEMENT', details: `Updated user ${user.id}: explicitly linked OIDC identity for ${issuer}` } });
      });
      app.hash = 'oidc-linked=1';
    } else {
      const identity = await this.prisma.userExternalIdentity.findUnique({ where: { issuer_subject: { issuer, subject } }, include: { user: true } });
      if (!identity || identity.user.status !== 'ACTIVE') throw new UnauthorizedException('Link this identity from your EverGreen Security Settings first');
      const ticket = randomBytes(32).toString('hex');
      this.tickets.set(hash(ticket), { cookie: hash(cookie), userId: identity.userId, expires: Date.now()+120000, attempts: 0, busy: false });
      app.hash = new URLSearchParams({ 'oidc-ticket': ticket }).toString();
    }
    return app.toString();
  }
  async complete(ticket: string, cookie: string, code?: string, recoveryCode?: string, ip?: string, userAgent?: string) {
    this.prune();
    const key = hash(ticket), entry = this.tickets.get(key);
    if (!entry || entry.cookie !== hash(cookie) || entry.busy || entry.attempts >= 6) throw new UnauthorizedException('SSO ticket is invalid or expired');
    entry.busy = true; entry.attempts++;
    try {
      const user = await this.prisma.user.findUnique({ where: { id: entry.userId } });
      if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');
      const result = await this.auth.login(user, { ip, userAgent }, code, recoveryCode);
      this.tickets.delete(key); return result;
    } finally { entry.busy = false; }
  }
  async identities(userId: number) { return this.prisma.userExternalIdentity.findMany({ where: { userId }, select: { id: true, issuer: true, subject: true, createdAt: true } }); }
  async unlink(id: string, userId: number, password: string, code?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !await verifyPassword(user.password, password)) throw new BadRequestException('Current password is incorrect');
    if (user.isTotpEnabled && (!code || !user.totpSecret || !(await new TOTP().verify(code, { secret: user.totpSecret })).valid)) throw new BadRequestException('Authenticator code is required');
    await this.prisma.$transaction(async tx => {
      const removed = await tx.userExternalIdentity.deleteMany({ where: { id, userId } });
      if (!removed.count) throw new BadRequestException('Identity not found');
      await appendUserAudit(tx, { data: { username: user.username, action: 'UNLINK_IDENTITY', module: 'USER_MANAGEMENT', details: `Updated user ${userId}: removed OIDC identity` } });
    });
    return { removed: true };
  }
}
