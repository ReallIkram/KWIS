import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173/KWIS/',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -w client',
    url: 'http://127.0.0.1:5173/KWIS/',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
