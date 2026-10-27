import { beforeAll, describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createApp } from './app.js';
let app: ReturnType<typeof createApp>;
beforeAll(() => {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
  process.env.JWT_SECRET = 'unit-test-secret-of-at-least-32-characters';
  process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
  process.env.NODE_ENV = 'test';
  app = createApp();
});
describe('API boundary security', () => {
  it('protects admin content without a session', async () => {
    const r = await supertest(app).get('/api/v1/admin/content/team');
    expect(r.status).toBe(401);
  });
  it('rejects mutation from an untrusted browser origin', async () => {
    const r = await supertest(app)
      .post('/api/v1/auth/login')
      .set('Origin', 'https://untrusted.example')
      .send({ email: 'owner@example.com', password: 'anything' });
    expect(r.status).toBe(403);
  });
  it('returns a failing health status when MongoDB is disconnected', async () => {
    const r = await supertest(app).get('/api/v1/health');
    expect(r.status).toBe(503);
    expect(r.body.status).toBe('database unavailable');
  });
  it('rejects invalid submissions before database access', async () => {
    const r = await supertest(app)
      .post('/api/v1/public/contact')
      .send({ name: 'a', email: 'bad', message: 'short' });
    expect(r.status).toBe(400);
    expect(r.body.error).toContain('email');
  });
  it('does not leak server internals on unknown routes', async () => {
    const r = await supertest(app).get('/api/v1/private');
    expect(r.status).toBe(404);
    expect(r.body).toEqual({ error: 'Route not found' });
    expect(r.headers['x-powered-by']).toBeUndefined();
    expect(r.headers['x-content-type-options']).toBe('nosniff');
  });
});
