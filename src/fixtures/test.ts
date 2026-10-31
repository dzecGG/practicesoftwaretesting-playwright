import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { registerNewCustomer, type RegisteredCustomer } from '../data/customers';

// Settings each project can change in playwright.config.ts
export type TestOptions = {
  apiURL: string;
  envName: string;
};

type Fixtures = {
  api: ApiClient;
  newCustomer: RegisteredCustomer;
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
});

export { expect };