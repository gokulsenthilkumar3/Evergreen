import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { blankTemplate, IMPORT_COLUMNS } from './import.columns';

describe('private import templates', () => {
  it.each(['suppliers', 'raw-materials'] as const)('%s template contains only the defined header row', (kind) => {
    const csv = blankTemplate(kind);
    expect(csv).toBe(`${IMPORT_COLUMNS[kind].map((column) => column.name).join(',')}\r\n`);
    expect(csv.trim().split(/\r?\n/)).toHaveLength(1);
  });

  it('requires authentication before exposing a template or accepting a file', async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://invalid:invalid@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-secret-at-least-16-characters';
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-at-least-16-characters';
    // Load after setting test-only environment values. No database call is made
    // because authentication rejects these requests first.
    const { default: router } = await import('./import.routes');
    const app = express();
    app.use(router);

    await request(app).get('/suppliers/import/template').expect(401);
    await request(app).get('/raw-materials/import/template?format=json').expect(401);
    await request(app).post('/suppliers/import').attach('file', Buffer.from('Name\r\nTest\r\n'), 'supplier.csv').expect(401);

    const { prisma } = await import('../../prisma/client');
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'user-test', email: 'test@example.com', status: 'ACTIVE', allowedIPs: [],
    } as never);
    jest.spyOn(prisma.userRole, 'findMany').mockResolvedValue([]);
    const token = jwt.sign({ sub: 'user-test' }, process.env.JWT_ACCESS_SECRET!);
    try {
      await request(app).get('/suppliers/import/template').set('Authorization', `Bearer ${token}`).expect(403);
      await request(app).post('/raw-materials/import').set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('Batch No\r\nB-1\r\n'), 'raw.csv').expect(403);
    } finally {
      jest.restoreAllMocks();
    }
  }, 20_000);
});
