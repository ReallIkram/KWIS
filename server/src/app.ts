import express from 'express';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { z } from 'zod';
import { config, kinds } from './config.js';
import { Content, User, Session, Submission, Media, Activity } from './models.js';
import { contentInput, validateData, publicContent } from './content.js';
import { requireAuth, adminOnly, issueSession, clearCookies, hash, passwordHash } from './auth.js';
import { upload, cloud } from './media.js';
import { sendMail } from './mail.js';
import pino from 'pino';
export const logger = pino({ redact: ['password', 'token', 'cookie', 'authorization'] });
const fail = (status: number, message: string) => Object.assign(new Error(message), { status });
const id = z.string().regex(/^[a-f\d]{24}$/i);
const email = z
  .email()
  .max(254)
  .transform((s) => s.toLowerCase());
const password = z
  .string()
  .min(12)
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must be at most 72 UTF-8 bytes',
  );
const account = z.object({
  name: z.string().min(1).max(100),
  email,
  password,
  role: z.enum(['admin', 'editor']),
});
const submission = z.object({
  name: z.string().min(2).max(100),
  email,
  phone: z.string().max(40).default(''),
  company: z.string().max(160).default(''),
  service: z.string().max(160).default(''),
  budget: z.string().max(100).default(''),
  message: z.string().min(10).max(10000),
  job: z.string().max(160).optional(),
  portfolio: z.union([z.url(), z.literal('')]).optional(),
  linkedin: z.union([z.url(), z.literal('')]).optional(),
  website: z.string().max(0).optional(),
});
const paging = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  search: z.string().max(100).default(''),
  status: z.string().max(50).optional(),
});
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function createApp() {
  const app = express();
  const cfg = config();
  const origins = cfg.FRONTEND_ORIGIN.split(',').map((s) => s.trim());
  app.disable('x-powered-by');
  // Configure the exact proxy count at the hosting provider, never trust arbitrary forwarded IPs.
  if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
  app.use(
    helmet(),
    cors({
      origin: (origin, cb) => cb(null, !origin || origins.includes(origin)),
      credentials: true,
    }),
    express.json({ limit: '1mb' }),
    cookieParser(),
  );
  app.use(
    '/api',
    rateLimit({ windowMs: 60000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }),
  );
  app.use((req, res, next) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.origin &&
      !origins.includes(req.headers.origin)
    )
      return res.status(403).json({ error: 'Origin is not allowed' });
    next();
  });
  app.get('/api/v1/health', (_req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'database unavailable' }),
  );
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });
  app.post('/api/v1/auth/login', authLimit, async (req, res) => {
    const data = z.object({ email, password: z.string().min(1).max(128) }).parse(req.body);
    const user = await User.findOne({ email: data.email, active: true }).select('+password');
    if (!user || !(await bcrypt.compare(data.password, user.password)))
      throw fail(401, 'Invalid email or password');
    res.json({ data: await issueSession(res, user) });
  });
  app.post('/api/v1/auth/refresh', authLimit, async (req, res) => {
    const token = req.cookies.kwis_refresh;
    if (!token) throw fail(401, 'Sign in to continue');
    const session = await Session.findOneAndDelete({
      hash: hash(token),
      expires: { $gt: new Date() },
    });
    const user = session && (await User.findById(session.userId));
    if (!user?.active) throw fail(401, 'Session expired');
    res.json({ data: await issueSession(res, user) });
  });
  app.post('/api/v1/auth/logout', async (req, res) => {
    if (req.cookies.kwis_refresh) await Session.deleteOne({ hash: hash(req.cookies.kwis_refresh) });
    clearCookies(res);
    res.json({ data: true });
  });
  app.get('/api/v1/auth/me', requireAuth, (req, res) => res.json({ data: req.user }));
  app.post('/api/v1/auth/forgot', authLimit, async (req, res) => {
    const data = z.object({ email }).parse(req.body);
    const user = await User.findOne({ email: data.email, active: true });
    if (user) {
      const token = randomBytes(32).toString('hex');
      user.resetHash = hash(token);
      user.resetExpires = new Date(Date.now() + 1800000);
      await user.save();
      await sendMail(
        'Reset your KWIS password',
        `Reset your password within 30 minutes: ${(process.env.ADMIN_SITE_URL || process.env.PUBLIC_SITE_URL || origins[0]).replace(/\/$/, '')}/#/admin/reset?token=${token}`,
        user.email,
      ).catch(() => logger.warn('Password reset email delivery failed'));
    }
    res.json({
      data: 'If the account exists and email delivery is configured, reset instructions will be sent.',
    });
  });
  app.post('/api/v1/auth/reset', authLimit, async (req, res) => {
    const data = z.object({ token: z.string().length(64), password }).parse(req.body);
    const user = await User.findOne({
      resetHash: hash(data.token),
      resetExpires: { $gt: new Date() },
    });
    if (!user) throw fail(400, 'Reset link is invalid or expired');
    user.password = await passwordHash(data.password);
    user.resetHash = undefined;
    user.resetExpires = undefined;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    await Session.deleteMany({ userId: user._id });
    clearCookies(res);
    res.json({ data: true });
  });
  app.get('/api/v1/public/content', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ data: await publicContent() });
  });
  const formLimit = rateLimit({
    windowMs: 3600000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });
  app.post('/api/v1/public/contact', formLimit, async (req, res) => {
    const data = submission.parse(req.body);
    await Submission.create({ ...data, kind: 'messages' });
    void sendMail('New KWIS inquiry', `${data.name}\n${data.email}\n${data.message}`).catch(() =>
      logger.warn('Inquiry email notification failed'),
    );
    res.status(201).json({ data: { message: 'Your inquiry has been received.' } });
  });
  app.post('/api/v1/public/newsletter', formLimit, async (req, res) => {
    const data = z.object({ email, website: z.string().max(0).optional() }).parse(req.body);
    await Submission.updateOne(
      { kind: 'subscribers', email: data.email },
      { $setOnInsert: { email: data.email, kind: 'subscribers' } },
      { upsert: true },
    );
    res.status(201).json({ data: true });
  });
  const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  }).single('resume');
  app.post('/api/v1/public/applications', formLimit, resumeUpload, async (req, res) => {
    const data = submission.extend({ job: z.string().min(1).max(160) }).parse(req.body);
    const job = await Content.findOne({
      kind: 'careers',
      slug: data.job,
      published: { $ne: null },
    });
    if (
      !job ||
      job.published.data.closed ||
      (job.published.data.deadline && new Date(job.published.data.deadline) < new Date())
    )
      throw fail(400, 'This position is not accepting applications');
    if (!req.file) throw fail(400, 'A PDF resume is required');
    const media = await Media.create({
      ...(await upload(req.file.buffer, true)),
      name: req.file.originalname,
    });
    await Submission.create({ ...data, kind: 'applications', resume: String(media._id) });
    res.status(201).json({ data: true });
  });
  app.use('/api/v1/admin', requireAuth);
  const audit = async (actor: string, action: string, target: string) =>
    Activity.create({ actor, action, target });
  app.get('/api/v1/admin/dashboard', async (_req, res) => {
    const content = await Content.aggregate([
      {
        $group: {
          _id: '$kind',
          total: { $sum: 1 },
          published: { $sum: { $cond: [{ $ne: ['$published', null] }, 1, 0] } },
        },
      },
    ]);
    const inbox = await Submission.aggregate([
      {
        $group: {
          _id: '$kind',
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        },
      },
    ]);
    res.json({
      data: {
        content,
        inbox,
        activity: await Activity.find().sort({ createdAt: -1 }).limit(12).lean(),
      },
    });
  });
  app.get('/api/v1/admin/activity', adminOnly, async (_req, res) =>
    res.json({ data: await Activity.find().sort({ createdAt: -1 }).limit(100).lean() }),
  );
  app.get('/api/v1/admin/profile', (req, res) => res.json({ data: req.user }));
  app.patch('/api/v1/admin/profile', async (req, res) => {
    const data = z
      .object({
        name: z.string().min(1).max(100),
        currentPassword: z.string().optional(),
        password: password.optional(),
      })
      .parse(req.body);
    const user = await User.findById(req.user!.id).select('+password');
    if (!user) throw fail(404, 'Account not found');
    user.name = data.name;
    if (data.password) {
      if (!data.currentPassword || !(await bcrypt.compare(data.currentPassword, user.password)))
        throw fail(400, 'Current password is incorrect');
      user.password = await passwordHash(data.password);
      user.sessionVersion = (user.sessionVersion || 0) + 1;
      await Session.deleteMany({ userId: user._id });
    }
    await user.save();
    if (data.password) clearCookies(res);
    res.json({ data: true });
  });
  app.get('/api/v1/admin/users', adminOnly, async (_req, res) =>
    res.json({ data: await User.find().select('-resetExpires').lean() }),
  );
  app.post('/api/v1/admin/users', adminOnly, async (req, res) => {
    const data = account.parse(req.body);
    const user = await User.create({ ...data, password: await passwordHash(data.password) });
    await audit(req.user!.email, 'created user', String(user._id));
    res.status(201).json({ data: { id: user._id } });
  });
  app.patch('/api/v1/admin/users/:id', adminOnly, async (req, res) => {
    const data = z
      .object({
        name: z.string().min(1).max(100),
        role: z.enum(['admin', 'editor']),
        active: z.boolean(),
      })
      .parse(req.body);
    id.parse(req.params.id);
    if (req.params.id === req.user!.id && (data.role !== 'admin' || !data.active))
      throw fail(400, 'You cannot remove your own administrator access');
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: data, $inc: { sessionVersion: 1 } },
      { new: true },
    );
    if (!user) throw fail(404, 'User not found');
    await Session.deleteMany({ userId: user._id });
    await audit(req.user!.email, 'updated user', String(user._id));
    res.json({ data: true });
  });
  app.delete('/api/v1/admin/users/:id', adminOnly, async (req, res) => {
    id.parse(req.params.id);
    if (req.params.id === req.user!.id) throw fail(400, 'You cannot delete your own account');
    await User.findByIdAndDelete(req.params.id);
    await Session.deleteMany({ userId: req.params.id });
    await audit(req.user!.email, 'deleted user', req.params.id as string);
    res.json({ data: true });
  });
  app.get('/api/v1/admin/inbox/:kind', async (req, res) => {
    const kind = z.enum(['messages', 'applications', 'subscribers']).parse(req.params.kind);
    const q = paging.parse(req.query);
    const filter = {
      kind,
      ...(q.status ? { status: q.status } : {}),
      ...(q.search
        ? {
            $or: [
              { name: { $regex: escapeRegex(q.search), $options: 'i' } },
              { email: { $regex: escapeRegex(q.search), $options: 'i' } },
            ],
          }
        : {}),
    };
    res.json({
      data: await Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      total: await Submission.countDocuments(filter),
    });
  });
  app.get('/api/v1/admin/export/:kind', async (req, res) => {
    const kind = z.enum(['messages', 'applications', 'subscribers']).parse(req.params.kind);
    const rows = await Submission.find({ kind }).lean();
    const fields = ['name', 'email', 'phone', 'company', 'message', 'status', 'notes'];
    const cell = (v: unknown) => {
      let s = String(v ?? '');
      if (/^\s*[=+@\-\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };
    res
      .type('text/csv')
      .attachment(`${kind}.csv`)
      .send(
        [
          fields.join(','),
          ...rows.map((r) => fields.map((f) => cell(r[f as keyof typeof r])).join(',')),
        ].join('\r\n'),
      );
  });
  app.patch('/api/v1/admin/inbox/:id', async (req, res) => {
    id.parse(req.params.id);
    const data = z
      .object({
        status: z.enum([
          'new',
          'read',
          'replied',
          'qualified',
          'archived',
          'reviewing',
          'shortlisted',
          'rejected',
          'hired',
        ]),
        notes: z.string().max(10000),
      })
      .parse(req.body);
    res.json({ data: await Submission.findByIdAndUpdate(req.params.id, data, { new: true }) });
  });
  app.delete('/api/v1/admin/inbox/:id', async (req, res) => {
    id.parse(req.params.id);
    const submission = await Submission.findById(req.params.id);
    if (submission?.resume) {
      const media = await Media.findById(submission.resume);
      if (media) {
        await cloud().uploader.destroy(media.publicId, {
          resource_type: 'raw',
          type: 'authenticated',
        });
        await media.deleteOne();
      }
    }
    await submission?.deleteOne();
    await audit(req.user!.email, 'deleted submission', req.params.id as string);
    res.json({ data: true });
  });
  app.get('/api/v1/admin/media', async (req, res) => {
    const q = paging.parse(req.query);
    res.json({
      data: await Media.find({
        private: false,
        ...(q.search ? { name: { $regex: escapeRegex(q.search), $options: 'i' } } : {}),
      })
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
    });
  });
  app.post(
    '/api/v1/admin/media',
    multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024, files: 1 },
    }).single('file'),
    async (req, res) => {
      if (!req.file) throw fail(400, 'Select a file');
      const media = await Media.create({
        ...(await upload(req.file.buffer)),
        name: req.file.originalname,
        alt: '',
        owner: req.user!.id,
      });
      await audit(req.user!.email, 'uploaded media', String(media._id));
      res.status(201).json({ data: media });
    },
  );
  app.patch('/api/v1/admin/media/:id', async (req, res) => {
    id.parse(req.params.id);
    const data = z
      .object({ name: z.string().min(1).max(200), alt: z.string().max(500) })
      .parse(req.body);
    res.json({
      data: await Media.findOneAndUpdate({ _id: req.params.id, private: false }, data, {
        new: true,
      }),
    });
  });
  app.get('/api/v1/admin/resume/:id', async (req, res) => {
    id.parse(req.params.id);
    const media = await Media.findOne({ _id: req.params.id, private: true });
    if (!media) throw fail(404, 'Resume not found');
    const url = cloud().utils.private_download_url(media.publicId, 'pdf', {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 60,
      attachment: true,
    });
    res.json({ data: { url } });
  });
  app.delete('/api/v1/admin/media/:id', async (req, res) => {
    id.parse(req.params.id);
    const media = await Media.findOne({ _id: req.params.id, private: false });
    if (!media) throw fail(404, 'Media not found');
    const content = await Content.find().lean();
    if (content.some((c) => JSON.stringify(c).includes(media.url)))
      throw fail(409, 'This file is in use. Remove content references first.');
    await cloud().uploader.destroy(media.publicId, {
      resource_type: media.resourceType as 'image' | 'video' | 'raw',
    });
    await media.deleteOne();
    res.json({ data: true });
  });
  app.param('contentKind', (req, _res, next, value) => {
    if (!kinds.includes(value)) return next(fail(404, 'Unknown content collection'));
    next();
  });
  app.get('/api/v1/admin/content/:contentKind', async (req, res) => {
    const q = paging.parse(req.query);
    const filter = {
      kind: req.params.contentKind,
      ...(q.search ? { title: { $regex: escapeRegex(q.search), $options: 'i' } } : {}),
    };
    res.json({
      data: await Content.find(filter)
        .sort({ order: 1, createdAt: 1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      total: await Content.countDocuments(filter),
    });
  });
  app.post('/api/v1/admin/content/:contentKind', async (req, res) => {
    const data = contentInput.parse(req.body);
    const row = await Content.create({
      ...data,
      data: validateData(req.params.contentKind as string, data.data),
      kind: req.params.contentKind,
      updatedBy: req.user!.email,
    });
    await audit(req.user!.email, 'created draft', String(row._id));
    res.status(201).json({ data: row });
  });
  app.put('/api/v1/admin/content/:contentKind/:id', async (req, res) => {
    id.parse(req.params.id);
    const data = contentInput.parse(req.body);
    const row = await Content.findOneAndUpdate(
      { _id: req.params.id, kind: req.params.contentKind },
      {
        $set: {
          ...data,
          data: validateData(req.params.contentKind as string, data.data),
          updatedBy: req.user!.email,
        },
      },
      { new: true, runValidators: true },
    );
    if (!row) throw fail(404, 'Content not found');
    await audit(req.user!.email, 'saved draft', String(row._id));
    res.json({ data: row });
  });
  app.post('/api/v1/admin/content/:contentKind/:id/:action', async (req, res) => {
    id.parse(req.params.id);
    const action = z.enum(['publish', 'unpublish', 'duplicate']).parse(req.params.action);
    const row = await Content.findOne({ _id: req.params.id, kind: req.params.contentKind });
    if (!row) throw fail(404, 'Content not found');
    if (action === 'duplicate') {
      const copy = await Content.create({
        kind: row.kind,
        title: `${row.title} (copy)`,
        slug: `${row.slug}-${randomBytes(3).toString('hex')}`,
        data: row.data,
        order: row.order,
      });
      return res.status(201).json({ data: copy });
    }
    row.published =
      action === 'publish'
        ? { title: row.title, slug: row.slug, order: row.order, data: row.data }
        : null;
    row.publishedAt = action === 'publish' ? new Date() : undefined;
    await row.save();
    await audit(req.user!.email, action, String(row._id));
    res.json({ data: row });
  });
  app.delete('/api/v1/admin/content/:contentKind/:id', async (req, res) => {
    id.parse(req.params.id);
    const row = await Content.findOneAndDelete({
      _id: req.params.id,
      kind: req.params.contentKind,
    });
    if (!row) throw fail(404, 'Content not found');
    await audit(req.user!.email, 'deleted content', req.params.id as string);
    res.json({ data: true });
  });
  if (process.env.SERVE_CLIENT === 'true')
    app.use('/KWIS', express.static(fileURLToPath(new URL('../../client/dist', import.meta.url))));
  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use(
    (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({ error: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') });
      const e = error as Error & { status?: number; code?: number };
      if (e.code === 11000)
        return res.status(409).json({ error: 'This slug or email already exists' });
      const status = e instanceof multer.MulterError ? 400 : e.status || 500;
      if (status >= 500) logger.error({ type: e.name }, 'Request failed');
      res.status(status).json({
        error:
          status >= 500 && status !== 503 ? 'Something went wrong. Please try again.' : e.message,
      });
    },
  );
  return app;
}
