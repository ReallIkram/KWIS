import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import { User, Session, Content, Submission } from '../server/src/models';
import { passwordHash } from '../server/src/auth';
const enabled = process.env.RUN_FULLSTACK_E2E === '1';
test.describe('real API and MongoDB workflow', () => {
  test.skip(!enabled, 'Requires a running local API and MongoDB; enable RUN_FULLSTACK_E2E=1');
  const email = `e2e-${randomBytes(6).toString('hex')}@example.invalid`;
  const password = randomBytes(24).toString('hex');
  const slug = 'e2e-' + randomBytes(6).toString('hex');
  let userId: string;
  test.beforeAll(async () => {
    await mongoose.connect(process.env.E2E_MONGODB_URI || 'mongodb://127.0.0.1:27017/kwis');
    const u = await User.create({
      name: 'Browser test owner',
      email,
      password: await passwordHash(password),
      role: 'admin',
    });
    userId = String(u._id);
  });
  test.afterAll(async () => {
    if (userId) {
      await Session.deleteMany({ userId });
      await User.deleteOne({ _id: userId });
      await Content.deleteMany({ slug });
      await Submission.deleteMany({ email });
    }
    await mongoose.disconnect();
  });
  test('owner adds, publishes, edits and removes a team member through the dashboard', async ({
    page,
    context,
  }) => {
    await page.goto('./#/admin/login');
    await page.getByLabel('Email address', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in to workspace' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Good to see you');
    await page
      .getByRole('navigation', { name: 'Admin navigation' })
      .getByRole('link', { name: 'Team members', exact: true })
      .click();
    await page.getByRole('button', { name: 'Add team member' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Title / heading *').fill('E2E team member');
    await dialog.getByLabel('URL slug *').fill(slug);
    await dialog.getByLabel('Job title', { exact: true }).fill('Test engineer');
    await dialog
      .getByLabel('Biography', { exact: true })
      .fill('An automated test member, removed after verification.');
    await dialog.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Publish', exact: true })).toBeVisible();
    const publicPage = await context.newPage();
    await publicPage.goto('./#/team');
    await expect(
      publicPage.getByRole('heading', { name: 'E2E team member', exact: true }),
    ).toHaveCount(0);
    await page.bringToFront();
    await dialog.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('Published.');
    await publicPage.reload();
    await expect(
      publicPage.getByRole('heading', { name: 'E2E team member', exact: true }),
    ).toBeVisible();
    await dialog.getByLabel('Title / heading *').fill('E2E edited member');
    await dialog.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('Draft saved.');
    await publicPage.reload();
    await expect(
      publicPage.getByRole('heading', { name: 'E2E team member', exact: true }),
    ).toBeVisible();
    await expect(
      publicPage.getByRole('heading', { name: 'E2E edited member', exact: true }),
    ).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('Published.');
    await publicPage.reload();
    await expect(
      publicPage.getByRole('heading', { name: 'E2E edited member', exact: true }),
    ).toBeVisible();
    page.once('dialog', (d) => d.accept());
    await dialog.getByRole('button', { name: 'Close editor' }).click();
    page.once('dialog', (d) => d.accept());
    await page
      .locator('.content-row')
      .filter({ hasText: 'E2E edited member' })
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('Content deleted');
    await publicPage.reload();
    await expect(
      publicPage.getByRole('heading', { name: 'E2E edited member', exact: true }),
    ).toHaveCount(0);
    await page.screenshot({ path: 'test-results/admin-desktop.png', fullPage: true });
    await page
      .getByRole('navigation', { name: 'Admin navigation' })
      .getByRole('link', { name: 'Overview', exact: true })
      .click();
    await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'Open sidebar' }).click();
    await page
      .getByRole('navigation', { name: 'Admin navigation' })
      .getByRole('link', { name: 'Contact inbox', exact: true })
      .click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await publicPage.close();
  });
  test('contact form persists an inquiry into the administrator inbox', async ({ page }) => {
    await page.goto('./#/contact');
    await page.getByLabel('Full name *').fill('E2E inquiry');
    await page.getByLabel('Email address *').fill(email);
    await page
      .getByLabel('Your project *')
      .fill('Verify persistence of this real browser inquiry.');
    await page.getByRole('button', { name: 'Send your inquiry' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Your inquiry has been received' }),
    ).toBeVisible();
    const stored = await Submission.findOne({ email, kind: 'messages' });
    expect(stored?.message).toBe('Verify persistence of this real browser inquiry.');
  });
});
