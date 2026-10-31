import { devices } from '@playwright/test';
import baseConfig, { environments } from './playwright.config';

// The same tests, pointed at the version of the site with planted bugs
export default {
  ...baseConfig,
  retries: 0,
  reporter: [['html', { outputFolder: 'playwright-report-bugs', open: 'never' }], ['list']],
  projects: [
    { name: 'setup-bugs', testMatch: /.*\.setup\.ts/, use: environments.bugs },
    { name: 'api-bugs', testMatch: /api\/.*\.spec\.ts/, use: environments.bugs },
    {
      name: 'chromium-bugs',
      testIgnore: /api\//,
      dependencies: ['setup-bugs'],
      use: { ...devices['Desktop Chrome'], ...environments.bugs },
    },
  ],
};