import { ConflictException } from '@nestjs/common';
import { HelpdeskService } from './helpdesk.controller';
import type { PrismaService } from '../../services/prisma.service';
describe('Helpdesk access and retry safety', () => {
  const ticket = {
    id: 'one',
    requestKey: 'key',
    subject: 'Invoice issue',
    description: 'Steps to reproduce the invoice issue',
    category: 'BUG',
    priority: 'NORMAL',
    createdBy: 'alice',
    status: 'OPEN',
    version: 1,
  };
  let db: {
    supportTicket: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
  };
  let service: HelpdeskService;
  beforeEach(() => {
    db = {
      supportTicket: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
    };
    service = new HelpdeskService(db as unknown as PrismaService);
  });
  it('staff see only their own tickets and admins see the installation queue', () => {
    void service.list({ username: 'alice', role: 'VIEWER' });
    expect(db.supportTicket.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { createdBy: 'alice' }, take: 100 }),
    );
    void service.list({ username: 'owner', role: 'ADMIN' });
    expect(db.supportTicket.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });
  it('replays the same submission without creating another ticket', async () => {
    db.supportTicket.findUnique.mockResolvedValue(ticket);
    await expect(
      service.create(ticket, { username: 'alice', role: 'VIEWER' }),
    ).resolves.toEqual(ticket);
    expect(db.supportTicket.create).not.toHaveBeenCalled();
  });
  it('rejects reuse by another user or different content', async () => {
    db.supportTicket.findUnique.mockResolvedValue(ticket);
    await expect(
      service.create(ticket, { username: 'bob', role: 'VIEWER' }),
    ).rejects.toThrow(ConflictException);
    await expect(
      service.create(
        { ...ticket, subject: 'Different issue' },
        { username: 'alice', role: 'VIEWER' },
      ),
    ).rejects.toThrow(ConflictException);
  });
  it('handles two concurrent retries through the unique submission key', async () => {
    db.supportTicket.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(ticket);
    db.supportTicket.create.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.create(ticket, { username: 'alice', role: 'VIEWER' }),
    ).resolves.toEqual(ticket);
  });
  it('requires a resolution and rejects stale updates', async () => {
    await expect(
      service.update('one', { status: 'RESOLVED', version: 1 }),
    ).rejects.toThrow(ConflictException);
    expect(db.supportTicket.updateMany).not.toHaveBeenCalled();
    db.supportTicket.updateMany.mockResolvedValue({ count: 0 });
    db.supportTicket.findUnique.mockResolvedValue(ticket);
    await expect(
      service.update('one', { status: 'IN_PROGRESS', version: 1 }),
    ).rejects.toThrow(ConflictException);
  });
  it('updates using optimistic concurrency without deleting ticket history', async () => {
    db.supportTicket.updateMany.mockResolvedValue({ count: 1 });
    db.supportTicket.findUniqueOrThrow.mockResolvedValue({
      ...ticket,
      status: 'RESOLVED',
      version: 2,
    });
    await service.update('one', {
      status: 'RESOLVED',
      resolution: 'Settings corrected',
      version: 1,
    });
    expect(db.supportTicket.updateMany).toHaveBeenCalledWith({
      where: { id: 'one', version: 1 },
      data: {
        status: 'RESOLVED',
        resolution: 'Settings corrected',
        version: { increment: 1 },
      },
    });
  });
});
