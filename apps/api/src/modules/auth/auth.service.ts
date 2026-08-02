import { Injectable, UnauthorizedException, OnModuleInit, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import { TOTP, generateURI } from 'otplib';
const authenticator = new TOTP();

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private emailService: EmailService
    ) { }

    async onModuleInit() {
        try {
            const count = await this.prisma.user.count();
            if (count === 0) {
                console.log('🌱 No users found in the database. Seeding default ADMIN user...');
                const hashedPassword = await bcrypt.hash('author123', SALT_ROUNDS);
                await this.prisma.user.create({
                    data: {
                        username: 'author',
                        password: hashedPassword,
                        role: 'ADMIN',
                        name: 'System Admin',
                        email: 'admin@evergreenyarn.com'
                    }
                });
                console.log('✅ Default ADMIN user created. Username: author | Password: author123 | ⚠️ Change immediately!');
            }
        } catch (e) {
            console.error('Failed to seed default user:', e);
        }
    }

    private async logActivity(username: string, action: string, details: string) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    username,
                    action,
                    module: 'USER_MANAGEMENT',
                    details
                }
            });
        } catch (e) {
            console.error('Failed to create log:', e);
        }
    }

    async signup(data: any): Promise<any> {
        const { username, email, name, password } = data;

        // Check if username or email already exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                throw new BadRequestException('Username is already taken');
            }
            if (existingUser.email === email) {
                throw new BadRequestException('Email is already registered');
            }
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await this.prisma.user.create({
            data: {
                username,
                email,
                name,
                password: hashedPassword,
                role: 'VIEWER'
            }
        });

        const { password: _, ...result } = newUser;
        return { message: 'Signup successful', user: result };
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { username }
        });

        if (!user) return null;

        // Support both bcrypt hashes and legacy plain-text passwords (for migration)
        let passwordMatch = false;
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            // Already bcrypt-hashed
            passwordMatch = await bcrypt.compare(pass, user.password);
        } else {
            // Legacy plain-text: compare directly, then auto-upgrade to bcrypt
            passwordMatch = user.password === pass;
            if (passwordMatch) {
                const hashed = await bcrypt.hash(pass, SALT_ROUNDS);
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashed }
                });
                console.log(`🔒 Auto-upgraded password hash for user: ${username}`);
            }
        }

        if (passwordMatch) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any, requestInfo?: { ip?: string, userAgent?: string, device?: string }, totpCode?: string) {
        // If TOTP is enabled, verify it
        if (user.isTotpEnabled) {
            if (!totpCode) {
                // Return a special error indicating TOTP is required
                throw new UnauthorizedException({ message: 'TOTP_REQUIRED', error: 'Unauthorized' });
            }
            
            const isValid = await authenticator.verify(totpCode, { secret: user.totpSecret });
            if (!isValid) {
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
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const res = await fetch(`https://ip-api.com/json/${ip}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await res.json();
                if (data.status === 'success') {
                    location = `${data.city}, ${data.country}`;
                }
            } catch (e) {
                // Geolocation is non-critical — silently fall back
                console.warn('Geolocation lookup failed or timed out');
            }
        }

        // Create a new session record
        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                ipAddress: ip,
                location: location,
                userAgent: requestInfo?.userAgent || 'Unknown',
                device: requestInfo?.device || 'Unknown',
                isValid: true,
            }
        });

        // Fire and forget email notification
        if (user.email) {
            this.emailService.sendLoginNotification(user.email, ip, requestInfo?.userAgent || 'Unknown', location).catch(e => console.error(e));
        }

        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            sessionId: session.id
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
            }
        };
    }

    async generateTotpSecret(userId: number, email: string) {
        const secret = authenticator.generateSecret();
        const otpauth = generateURI({ issuer: 'Ever Green Yarn Mills', label: email, secret });
        
        await this.prisma.user.update({
            where: { id: userId },
            data: { totpSecret: secret }
        });

        return { secret, otpauth };
    }

    async verifyAndEnableTotp(userId: number, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.totpSecret) {
            throw new BadRequestException('TOTP not setup');
        }

        const isValid = await authenticator.verify(code, { secret: user.totpSecret });
        if (!isValid) {
            throw new BadRequestException('Invalid authentication code');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { isTotpEnabled: true }
        });

        return { success: true };
    }

    async disableTotp(userId: number) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isTotpEnabled: false, totpSecret: null }
        });
        return { success: true };
    }
}
