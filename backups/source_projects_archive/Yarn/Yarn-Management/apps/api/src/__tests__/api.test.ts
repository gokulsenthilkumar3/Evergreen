import request from 'supertest';
import { createApp } from '../app';

describe('Health Check API', () => {
    const app = createApp();

    describe('GET /health', () => {
        it('should return 200 OK with health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('ok');
            expect(response.body.ok).toBe(true);
        });
    });
});

describe('API Error Handling', () => {
    const app = createApp();

    describe('404 Not Found', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/api/non-existent-endpoint')
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });
    });
});
