import { test, expect } from '@playwright/test';
import { seedRows } from '../server/src/seed';
// Browser presentation tests use explicit API fixtures, not a substitute for DB integration.
const content = seedRows
  .map((r, i) => ({ ...r, id: String(i), order: r.order || 0 }))
  .sort((a, b) => a.order - b.order);
test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/public/content')) return route.fulfill({ json: { data: content } });
    if (url.endsWith('/public/contact')) {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: body.message?.length >= 10 ? 201 : 400,
        json: { data: { message: 'Received' } },
      });
    }
    if (url.endsWith('/auth/me'))
      return route.fulfill({ status: 401, json: { error: 'Sign in to continue' } });
    if (url.endsWith('/auth/refresh'))
      return route.fulfill({ status: 401, json: { error: 'Session expired' } });
    return route.fulfill({ status: 404, json: { error: 'Fixture route not configured' } });
  });
});
test('homepage, navigation and contact form work at the repository subpath', async ({ page }) => {
  await page.goto('./#/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Building digital experiences',
  );
  await page.getByRole('link', { name: 'Explore our services', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas into impact.');
  await page
    .getByRole('heading', { name: 'Web development', exact: true })
    .getByRole('link')
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Web development');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Web development');
  await page.goto('./#/contact');
  await page.getByLabel('Full name *').fill('Test visitor');
  await page.getByLabel('Email address *').fill('visitor@example.com');
  await page.getByLabel('Your project *').fill('We would like to discuss a new application.');
  await page.getByRole('button', { name: 'Send your inquiry' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Your inquiry has been received' }),
  ).toBeVisible();
});
test('all required public pages render and contain no horizontal overflow', async ({ page }) => {
  for (const path of [
    'about',
    'services',
    'portfolio',
    'team',
    'technologies',
    'industries',
    'blog',
    'careers',
    'contact',
    'privacy-policy',
    'terms-and-conditions',
  ]) {
    await page.goto('./#/' + path);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
test('mobile menu is usable and homepage fits a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./#/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Our Team', exact: true })
    .click();
  await expect(page.locator('main h1')).toContainText('minds behind');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
});
test('unauthenticated dashboard redirects to sign in', async ({ page }) => {
  await page.goto('./#/admin/team');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await expect(page).toHaveURL(/admin\/login/);
});
test('homepage visual record', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./#/');
  await expect(page.locator('main h1')).toBeVisible();
  await page.screenshot({ path: 'test-results/homepage-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'test-results/homepage-mobile.png', fullPage: true });
});
