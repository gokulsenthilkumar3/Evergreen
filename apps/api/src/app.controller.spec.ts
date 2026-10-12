import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ROLES_KEY } from './decorators/roles.decorator';
import { PrismaService } from './services/prisma.service';

// Keep transport tests isolated from the operational database.
describe('AppController health routes', () => {
  let controller: AppController;
  const publicHealth = { service: 'evergreen-api', status: 'ok', database: true, timestamp: '2026-10-12T12:00:00Z' };
  const service = {
    getPublicHealth: jest.fn(),
    getHealthData: jest.fn().mockResolvedValue({ status: 'ok', processors: [] }),
  };
  const response = () => ({ status: jest.fn().mockReturnThis() }) as unknown as Response & { status: jest.Mock };
  const reflector = new Reflector();

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getPublicHealth.mockResolvedValue(publicHealth);
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: service }],
    }).compile();
    controller = module.get(AppController);
  });

  it.each(['index', 'health'] as const)('%s answers with the public probe only', async route => {
    const res = response();
    await expect(controller[route](res)).resolves.toEqual(publicHealth);
    expect(res.status).not.toHaveBeenCalled();
    expect(service.getHealthData).not.toHaveBeenCalled();
  });

  it('answers 503 when the database cannot be reached', async () => {
    service.getPublicHealth.mockResolvedValue({ ...publicHealth, status: 'degraded', database: false });
    const res = response();
    await expect(controller.health(res)).resolves.toMatchObject({ status: 'degraded' });
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('stays 200 when only a data problem is pending, so the app remains reachable to fix it', async () => {
    service.getPublicHealth.mockResolvedValue({ ...publicHealth, status: 'degraded' });
    const res = response();
    await controller.health(res);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('keeps the probes public and the operational detail administrator-only', () => {
    expect(reflector.get(IS_PUBLIC_KEY, AppController.prototype.index)).toBe(true);
    expect(reflector.get(IS_PUBLIC_KEY, AppController.prototype.health)).toBe(true);
    expect(reflector.get(IS_PUBLIC_KEY, AppController.prototype.status)).toBeUndefined();
    expect(reflector.get(ROLES_KEY, AppController.prototype.status)).toEqual(['ADMIN']);
  });

  it('exposes no other routes', () => {
    const routes = Object.getOwnPropertyNames(AppController.prototype).filter(name => name !== 'constructor' && Reflect.hasMetadata('path', AppController.prototype[name as keyof AppController]));
    expect(routes.sort()).toEqual(['health', 'index', 'status']);
  });
});

describe('AppService public health', () => {
  const prisma = { $queryRawUnsafe: jest.fn(), getStartupIssue: jest.fn() };
  const service = new AppService(prisma as unknown as PrismaService);

  beforeEach(() => {
    prisma.$queryRawUnsafe.mockResolvedValue([{ 1: 1 }]);
    prisma.getStartupIssue.mockReturnValue(null);
  });

  it('discloses nothing beyond service name, status and time', async () => {
    const health = await service.getPublicHealth();
    expect(Object.keys(health).sort()).toEqual(['database', 'service', 'status', 'timestamp']);
    expect(health).toMatchObject({ service: 'evergreen-api', status: 'ok', database: true });
  });

  it('reports degraded without saying why when a startup data problem is pending', async () => {
    prisma.getStartupIssue.mockReturnValue('Cost entry #12 (Expense) has an invalid amount.');
    const health = await service.getPublicHealth();
    expect(health.status).toBe('degraded');
    expect(JSON.stringify(health)).not.toContain('Cost entry');
  });

  it('reports the database as unreachable instead of throwing', async () => {
    prisma.$queryRawUnsafe.mockRejectedValue(new Error('connection refused'));
    await expect(service.getPublicHealth()).resolves.toMatchObject({ status: 'degraded', database: false });
  });
});
