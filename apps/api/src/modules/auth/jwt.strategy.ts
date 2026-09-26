import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { requireJwtSecret } from './jwt-secret';

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
      select: { id: true, username: true, role: true },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');

    // Also update lastActive
    await this.prisma.session
      .update({
        where: { id: session.id },
        data: { lastActive: new Date() },
      })
      .catch(() => {}); // fire and forget

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId: payload.sessionId,
    };
  }
}
