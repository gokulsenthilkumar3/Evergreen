import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key',
        });
    }

    async validate(payload: any) {
        // payload includes sessionId
        if (!payload.sessionId) {
            throw new UnauthorizedException('Invalid token structure');
        }

        const session = await this.prisma.session.findUnique({
            where: { id: payload.sessionId }
        });

        if (!session || !session.isValid) {
            throw new UnauthorizedException('Session has been revoked');
        }

        // Also update lastActive
        await this.prisma.session.update({
            where: { id: session.id },
            data: { lastActive: new Date() }
        }).catch(() => {}); // fire and forget

        return { userId: payload.sub, username: payload.username, role: payload.role, sessionId: payload.sessionId };
    }
}
