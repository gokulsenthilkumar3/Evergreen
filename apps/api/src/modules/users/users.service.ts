import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './users.dto';

const PUBLIC_USER_FIELDS = {
  id: true, username: true, name: true, email: true, role: true,
  createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string) {
    if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException('Password must contain at least 12 characters and at most 72 UTF-8 bytes');
    }
    return bcrypt.hash(password, 10);
  }

  private handleConflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Username or email already exists');
    }
    throw error;
  }

  async createUser(input: CreateUserDto, actor: string) {
    const password = await this.hashPassword(input.password);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { username: input.username, email: input.email, name: input.name, password, role: input.role ?? 'VIEWER', createdBy: actor },
          select: PUBLIC_USER_FIELDS,
        });
        await tx.activityLog.create({ data: { username: actor, action: 'CREATE', module: 'USER_MANAGEMENT', details: `Created user ${user.id} (${user.role})` } });
        return user;
      });
    } catch (error) { this.handleConflict(error); }
  }

  findAllUsers() {
    return this.prisma.user.findMany({ select: PUBLIC_USER_FIELDS, orderBy: { username: 'asc' } });
  }

  async updateUser(id: number, input: UpdateUserDto, actor: string) {
    const password = input.password === undefined ? undefined : await this.hashPassword(input.password);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('User not found');
        if (existing.role === 'ADMIN' && input.role !== undefined && input.role !== 'ADMIN' && await tx.user.count({ where: { role: 'ADMIN' } }) <= 1) {
          throw new BadRequestException('The last administrator cannot be demoted');
        }
        const user = await tx.user.update({
          where: { id },
          data: { username: input.username, name: input.name, email: input.email, role: input.role, password, updatedBy: actor },
          select: PUBLIC_USER_FIELDS,
        });
        if (password !== undefined || (input.role !== undefined && input.role !== existing.role)) {
          await tx.session.updateMany({ where: { userId: id, isValid: true }, data: { isValid: false } });
        }
        await tx.activityLog.create({ data: { username: actor, action: 'UPDATE', module: 'USER_MANAGEMENT', details: `Updated user ${id}: ${Object.keys(input).join(', ')}` } });
        return user;
      });
    } catch (error) { this.handleConflict(error); }
  }

  async deleteUser(id: number, actorId: number, actor: string) {
    if (id === actorId) throw new BadRequestException('You cannot delete your own account');
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      if (user.role === 'ADMIN' && await tx.user.count({ where: { role: 'ADMIN' } }) <= 1) {
        throw new BadRequestException('The last administrator cannot be deleted');
      }
      await tx.user.delete({ where: { id } });
      await tx.activityLog.create({ data: { username: actor, action: 'DELETE', module: 'USER_MANAGEMENT', details: `Deleted user ${id}` } });
      return { message: 'User deleted successfully' };
    });
  }
}
