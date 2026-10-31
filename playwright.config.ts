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
  // CI's own copy of the app, started with Docker (Milestone 10)
  local: {
    baseURL: 'http://localhost:4200',
    apiURL: 'http://localhost:8091',
    envName: 'local',
  },
};

// CI sets TEST_ENV=local to test its own copy of the app. Your computer uses the public site.
const target = process.env.TEST_ENV === 'local' ? environments.local : environments.main;

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
    { name: 'setup', testMatch: /.*\.setup\.ts/, use: target },
    { name: 'api', testMatch: /api\/.*\.spec\.ts/, use: target },
    {
      name: 'chromium',
      testIgnore: /api\//,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...target },
    },
    {
      name: 'firefox',
      testIgnore: /api\//,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], ...target },
    },
    {
      name: 'webkit',
      testIgnore: /api\//,
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], ...target },
    },
  ],
});