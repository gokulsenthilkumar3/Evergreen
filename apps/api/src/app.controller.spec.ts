import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Keep transport tests isolated from the operational database.
describe('AppController health representations', () => {
  let controller: AppController;
  const data = { service: 'evergreen-api', status: 'ok', timestamp: '2026-10-04T12:00:00Z' };
  const service = {
    getHealthData: jest.fn().mockResolvedValue(data),
    renderHealthDashboardHtml: jest.fn().mockResolvedValue('<html>Health hub</html>'),
  };
  const response = () => ({ type: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), setHeader: jest.fn().mockReturnThis() });
  const request = (accept: string, query: Record<string, string> = {}) => ({ headers: { accept }, query }) as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: service }],
    }).compile();
    controller = module.get(AppController);
  });

  it('serves HTML to browser health requests', async () => {
    const res = response();
    await controller.health(request('text/html'), res as unknown as Response);
    expect(res.type).toHaveBeenCalledWith('html');
    expect(res.send).toHaveBeenCalledWith('<html>Health hub</html>');
  });

  it('serves pretty JSON when explicitly requested, even with a UI flag', async () => {
    const res = response();
    await controller.health(request('text/html', { format: 'json', ui: '1' }), res as unknown as Response);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(res.send).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    expect(service.renderHealthDashboardHtml).not.toHaveBeenCalled();
  });

  it('defaults non-browser requests to JSON', async () => {
    const res = response();
    await controller.health(request('application/json'), res as unknown as Response);
    expect(service.getHealthData).toHaveBeenCalledWith(true);
    expect(res.send).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
  });

  it('allows an explicit UI request without an HTML accept header', async () => {
    const res = response();
    await controller.health(request('*/*', { ui: 'true' }), res as unknown as Response);
    expect(res.type).toHaveBeenCalledWith('html');
  });

  it('uses the same JSON contract for the API root', async () => {
    const res = response();
    await controller.index(request('text/html', { format: 'json' }), res as unknown as Response);
    expect(res.send).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
  });
});
