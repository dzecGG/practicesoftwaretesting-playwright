import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import type { TestOptions } from './src/fixtures/test';

export const environments = {
  main: {
    baseURL: 'https://practicesoftwaretesting.com',
    apiURL: 'https://api.practicesoftwaretesting.com',
    envName: 'main',
  },
  bugs: {
    baseURL: 'https://with-bugs.practicesoftwaretesting.com',
    apiURL: 'https://api-with-bugs.practicesoftwaretesting.com',
    envName: 'bugs',
  },
};

export default defineConfig<TestOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['blob'], ['github']] : [['html', { open: 'never' }], ['list']],
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/, use: environments.main },
    { name: 'api', testMatch: /api\/.*\.spec\.ts/, use: environments.main },
    {
      name: 'chromium',
      testIgnore: /api\//,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...environments.main },
    },
    {
      name: 'firefox',
      testIgnore: /api\//,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], ...environments.main },
    },
    {
      name: 'webkit',
      testIgnore: /api\//,
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], ...environments.main },
    },
  ],
});