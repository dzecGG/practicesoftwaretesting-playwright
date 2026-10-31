import { test as base, expect } from '@playwright/test';

// Settings each project can change in playwright.config.ts
export type TestOptions = {
  apiURL: string;
  envName: string;
};

export const test = base.extend<TestOptions>({
  apiURL: ['https://api.practicesoftwaretesting.com', { option: true }],
  envName: ['main', { option: true }],
});

export { expect };