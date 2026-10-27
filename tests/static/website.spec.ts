import { test, expect } from '@playwright/test';
test('standalone production website renders without API calls or credentials', async ({ page }) => {
  const apiCalls: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/')) apiCalls.push(r.url());
  });
  await page.goto('./#/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Building digital experiences',
  );
  await page.getByRole('link', { name: 'Explore our services', exact: true }).click();
  await expect(page.locator('main h1')).toHaveText('Ideas into impact.');
  await page
    .getByRole('heading', { name: 'Web development', exact: true })
    .getByRole('link')
    .click();
  await page.reload();
  await expect(page.locator('main h1')).toHaveText('Web development');
  await page.goto('./#/contact');
  await expect(
    page.getByRole('status').filter({ hasText: 'Online inquiries are not open yet' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send your inquiry' })).toHaveCount(0);
  await expect(page.getByText('Newsletter signup is coming soon.')).toBeVisible();
  await page.goto('./#/admin/login');
  await expect(page.getByRole('heading', { name: 'Workspace not connected yet.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in to workspace' })).toHaveCount(0);
  expect(apiCalls).toEqual([]);
});
test('standalone pages fit a phone and bundled content has no private records', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const slug of ['', 'about', 'team', 'portfolio', 'contact', 'blog', 'careers']) {
    await page.goto('./#/' + slug);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const response = await request.get('initial-content.json');
  expect(response.ok()).toBe(true);
  const { data } = await response.json();
  expect(data.length).toBeGreaterThan(0);
  expect(
    data.some((r: any) =>
      ['users', 'messages', 'applications', 'subscribers', 'sessions', 'media'].includes(r.kind),
    ),
  ).toBe(false);
  expect(JSON.stringify(data)).not.toMatch(
    /JWT_SECRET|CLOUDINARY_API_SECRET|passwordHash|resetHash/,
  );
});
