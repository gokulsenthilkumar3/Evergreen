import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService
    ) { }

    private async logActivity(username: string, action: string, details: string) {
        try {
            // @ts-ignore
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

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { username }
        });

        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any, requestInfo?: { ip?: string, userAgent?: string, device?: string }) {
        // Create a new session record
        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                ipAddress: requestInfo?.ip || 'Unknown',
                userAgent: requestInfo?.userAgent || 'Unknown',
                device: requestInfo?.device || 'Unknown', // Could parse UA for device type
                isValid: true,
            }
        });

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

    async createUser(userDto: any) {
        console.log('📝 Attempting to create user:', userDto.username);

        if (!userDto.username) {
            throw new UnauthorizedException('Username is required');
        }
        if (!userDto.password || userDto.password.length <= 5) {
            throw new UnauthorizedException('Password must be greater than 5 characters');
        }

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { username: userDto.username }
        });

        if (existingUser) {
            console.warn('⚠️ User already exists:', userDto.username);
            throw new UnauthorizedException('Username already exists');
        }

        const newUser = await this.prisma.user.create({
            data: {
                username: userDto.username,
                name: userDto.name,
                password: userDto.password, // In real app, hash this!
                role: userDto.role || 'VIEWER',
                email: userDto.email || `${userDto.username}-${Date.now()}@temp.local`,
                createdBy: userDto.createdBy,
            },
        });

        console.log('✅ User created successfully:', newUser.id);

        await this.logActivity(
            // Ideally we pass the admin username here, but for now we log the event
            'SYSTEM',
            'CREATE',
            `Created user: ${newUser.username} (${newUser.role})`
        );

        const { password, ...result } = newUser;
        return result;
    }

    async findAllUsers() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
                updatedBy: true,
            }
        });
        console.log(`📋 Fetched ${users.length} users:`, users.map((u: any) => u.username).join(', '));
        return users;
    }

    async deleteUser(id: string) {
        const userId = parseInt(id);
        console.log('🗑️ Attempting to delete user ID:', userId);

        if (isNaN(userId)) {
            throw new UnauthorizedException('Invalid user ID');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        await this.prisma.user.delete({
            where: { id: userId }
        });

        console.log('✅ User deleted successfully:', userId);

        await this.logActivity(
            'SYSTEM',
            'DELETE',
            `Deleted user ID: ${userId}`
        );

        return { message: 'User deleted successfully' };
    }

    async updateUser(id: string, userDto: any) {
        const userId = parseInt(id);
        console.log('🔄 Attempting to update user ID:', userId, 'with data:', userDto);

        if (isNaN(userId)) {
            throw new UnauthorizedException('Invalid user ID');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Check if username is being changed and if it already exists
        if (userDto.username && userDto.username !== user.username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username: userDto.username }
            });
            if (existingUser) {
                throw new UnauthorizedException('Username already exists');
            }
        }

        // Validate password if provided
        if (userDto.password && userDto.password.length <= 5) {
            throw new UnauthorizedException('Password must be greater than 5 characters');
        }

        // Build update data
        const updateData: any = {};
        if (userDto.username) updateData.username = userDto.username;
        if (userDto.name) updateData.name = userDto.name;
        if (userDto.password) updateData.password = userDto.password;

        // Handle email carefully: if empty string provided, we might want to keep it empty or set a temp
        if (userDto.email !== undefined) {
            updateData.email = userDto.email;
        }

        if (userDto.role) updateData.role = userDto.role;
        if (userDto.updatedBy) updateData.updatedBy = userDto.updatedBy;

        console.log('📡 Sending update to Prisma:', updateData);

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        console.log('✅ User updated successfully:', updatedUser.id);

        await this.logActivity(
            'SYSTEM',
            'UPDATE',
            `Updated user ${updatedUser.username}: ${Object.keys(updateData).join(', ')}`
        );

        return updatedUser;
    }
}
