import express from 'express';
import request from 'supertest';
import { trustedProxies } from './trusted-proxies';

describe('trusted deployment proxies', () => {
  const ipFrom = (socketAddress: string, forwarded: string) => {
    const app = express();
    app.set('trust proxy', trustedProxies('loopback,172.29.240.10'));
    app.use((req, _res, next) => {
      Object.defineProperty(req.socket, 'remoteAddress', { value: socketAddress });
      next();
    });
    app.get('/', (req, res) => res.json({ ip: req.ip }));
    return request(app).get('/').set('X-Forwarded-For', forwarded);
  };
  it('distinguishes two clients forwarded by the configured Docker proxy', async () => {
    expect((await ipFrom('172.29.240.10', '198.51.100.1')).body.ip).toBe('198.51.100.1');
    expect((await ipFrom('172.29.240.10', '198.51.100.2')).body.ip).toBe('198.51.100.2');
  });
  it('does not accept forged forwarding headers from a direct client or unrelated container', async () => {
    expect((await ipFrom('198.51.100.8', '1.2.3.4')).body.ip).toBe('198.51.100.8');
    expect((await ipFrom('172.29.240.99', '1.2.3.4')).body.ip).toBe('172.29.240.99');
    expect((await ipFrom('172.29.240.10', '1.2.3.4, 198.51.100.9')).body.ip).toBe('198.51.100.9');
  });
  it('rejects blanket trust, hop counts, malformed addresses and masks', () => {
    for (const value of ['true', '1', '*', '0.0.0.0/0', '::/0', '1.2.3.4/33', '1.2.3.4/-1', '1.2.3.4/24/x', ',']) {
      expect(() => trustedProxies(value)).toThrow();
    }
    expect(trustedProxies('loopback,127.0.0.1,10.20.0.0/24,::1/128')).toHaveLength(4);
  });
});
