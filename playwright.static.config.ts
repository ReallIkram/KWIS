import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/static',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/KWIS/',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined },
  },
  webServer: {
    command: 'npm run preview -w client -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/KWIS/',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
