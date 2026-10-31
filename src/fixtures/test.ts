import { test as base, expect, type Page } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { registerNewCustomer, type RegisteredCustomer } from '../data/customers';
import { authFile } from '../auth';

// Settings each project can change in playwright.config.ts
export type TestOptions = {
  apiURL: string;
  envName: string;
};

type Fixtures = {
  api: ApiClient;
  newCustomer: RegisteredCustomer;
  customerPage: Page;
  adminPage: Page;
};

export const test = base.extend<TestOptions & Fixtures>({
  apiURL: ['https://api.practicesoftwaretesting.com', { option: true }],
  envName: ['main', { option: true }],

  api: async ({ playwright, apiURL }, use) => {
    const request = await playwright.request.newContext({ baseURL: apiURL });
    await use(new ApiClient(request));
    await request.dispose();
  },

  newCustomer: async ({ api }, use) => {
    await use(await registerNewCustomer(api));
  },

  customerPage: async ({ browser, baseURL, envName }, use) => {
    const context = await browser.newContext({ baseURL, storageState: authFile(envName, 'customer') });
    await use(await context.newPage());
    await context.close();
  },

  adminPage: async ({ browser, baseURL, envName }, use) => {
    const context = await browser.newContext({ baseURL, storageState: authFile(envName, 'admin') });
    await use(await context.newPage());
    await context.close();
  },
});

export { expect };