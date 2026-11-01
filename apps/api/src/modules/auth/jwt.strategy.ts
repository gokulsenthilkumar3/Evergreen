import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { requireJwtSecret } from './jwt-secret';
import { DEFAULT_SESSION_POLICY, sessionExpired } from '../../utils/session-policy';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(configService),
    });
  }

  async validate(payload: any) {
    // payload includes sessionId
    if (!payload.sessionId) {
      throw new UnauthorizedException('Invalid token structure');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || !session.isValid || session.userId !== payload.sub) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, role: true, status: true, scopedAccess: true, accessRules: { where: { revokedAt: null }, select: { method: true, path: true, effect: true, expiresAt: true } } },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');
    const policy = await this.prisma.userSessionPolicy.findUnique({ where: { role: user.role } }) || DEFAULT_SESSION_POLICY;
    if (sessionExpired(session,policy)) throw new UnauthorizedException('Session expired under the account policy');

    // Also update lastActive
    await this.prisma.session
      .update({
        where: { id: session.id },
        data: { lastActive: new Date(), lastSeenAt: new Date() },
      })
      .catch(() => {}); // fire and forget

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId: payload.sessionId,
      scopedAccess: user.scopedAccess,
      accessRules: user.accessRules,
    };
  }
}
