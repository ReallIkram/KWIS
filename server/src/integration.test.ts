import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import { createApp } from './app.js';
import { User, Content, Submission } from './models.js';
import { passwordHash } from './auth.js';
import { seed } from './seed.js';
// Explicit integration opt-in keeps unit tests usable offline. CI enables it.
const suite = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip;
suite('MongoDB CMS lifecycle', () => {
  let mongo: MongoMemoryServer | undefined;
  let agent: ReturnType<typeof supertest.agent>;
  let app: ReturnType<typeof createApp>;
  beforeAll(async () => {
    const uri =
      process.env.TEST_MONGODB_URI ||
      (await (async () => {
        mongo = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
        return mongo.getUri();
      })());
    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'integration-secret-of-at-least-32-characters';
    process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
    process.env.NODE_ENV = 'test';
    await mongoose.connect(uri, { dbName: 'kwis_integration_' + Date.now() });
    await seed();
    await User.create({
      name: 'Test owner',
      email: 'owner@example.com',
      password: await passwordHash('test-only-password-123'),
      role: 'admin',
    });
    app = createApp();
    agent = supertest.agent(app);
  }, 120000);
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongo?.stop();
  });
  it('authenticates, protects private data, and persists drafts separately from publication', async () => {
    expect(
      (
        await agent
          .post('/api/v1/auth/login')
          .send({ email: 'owner@example.com', password: 'wrong' })
      ).status,
    ).toBe(401);
    expect(
      (
        await agent
          .post('/api/v1/auth/login')
          .send({ email: 'owner@example.com', password: 'test-only-password-123' })
      ).status,
    ).toBe(200);
    const created = await agent.post('/api/v1/admin/content/team').send({
      title: 'Test member',
      slug: 'test-member',
      order: 0,
      data: { position: 'Engineer', bio: 'Test biography' },
    });
    expect(created.status).toBe(201);
    const id = created.body.data._id;
    let result = await supertest(app).get('/api/v1/public/content');
    expect(result.body.data.some((r: any) => r.slug === 'test-member')).toBe(false);
    expect((await agent.post(`/api/v1/admin/content/team/${id}/publish`)).status).toBe(200);
    await agent.put(`/api/v1/admin/content/team/${id}`).send({
      title: 'Changed draft',
      slug: 'test-member',
      order: 0,
      data: { position: 'Senior engineer' },
    });
    result = await supertest(app).get('/api/v1/public/content');
    expect(result.body.data.find((r: any) => r.slug === 'test-member').title).toBe('Test member');
    await agent.post(`/api/v1/admin/content/team/${id}/publish`);
    result = await supertest(app).get('/api/v1/public/content');
    expect(result.body.data.find((r: any) => r.slug === 'test-member').title).toBe('Changed draft');
    expect((await Content.findById(id))?.title).toBe('Changed draft');
    await agent.post(`/api/v1/admin/content/team/${id}/unpublish`);
    result = await supertest(app).get('/api/v1/public/content');
    expect(result.body.data.some((r: any) => r.slug === 'test-member')).toBe(false);
    expect((await agent.delete(`/api/v1/admin/content/team/${id}`)).status).toBe(200);
  });
  it('stores contact submissions privately and exports safe CSV', async () => {
    const r = await supertest(app).post('/api/v1/public/contact').send({
      name: '=Formula test',
      email: 'visitor@example.com',
      message: 'A real test inquiry for our project.',
    });
    expect(r.status).toBe(201);
    expect(await Submission.countDocuments({ kind: 'messages' })).toBe(1);
    const pub = await supertest(app).get('/api/v1/public/content');
    expect(JSON.stringify(pub.body)).not.toContain('visitor@example.com');
    const csv = await agent.get('/api/v1/admin/export/messages');
    expect(csv.text).toContain("'=Formula test");
  });
  it('enforces editor role restrictions and revokes refresh on logout', async () => {
    await User.create({
      name: 'Editor',
      email: 'editor@example.com',
      password: await passwordHash('test-only-password-123'),
      role: 'editor',
    });
    const editor = supertest.agent(app);
    await editor
      .post('/api/v1/auth/login')
      .send({ email: 'editor@example.com', password: 'test-only-password-123' });
    expect((await editor.get('/api/v1/admin/users')).status).toBe(403);
    expect((await editor.get('/api/v1/admin/content/team')).status).toBe(200);
    await editor.post('/api/v1/auth/logout');
    expect((await editor.post('/api/v1/auth/refresh')).status).toBe(401);
  });
  it('seeds repeatably without overwriting editorial changes', async () => {
    const row = await Content.findOne({ kind: 'hero' });
    row!.title = 'Preserved draft';
    await row!.save();
    expect(await seed()).toBe(0);
    expect((await Content.findById(row!._id))!.title).toBe('Preserved draft');
  });
});
