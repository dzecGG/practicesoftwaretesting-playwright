import type { Page } from '@playwright/test';

export type Role = 'customer' | 'admin';

// Where each environment's saved logins live, e.g. playwright/.auth/main-admin.json
export function authFile(envName: string, role: Role): string {
  return `playwright/.auth/${envName}-${role}.json`;
}

// The site keeps its login token in localStorage under 'auth-token'.
// Putting a token there before the page loads logs the page in.
export async function signInWithToken(page: Page, token: string): Promise<void> {
  await page.addInitScript((value) => window.localStorage.setItem('auth-token', value), token);
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing. Add it to your .env file.`);
  return value;
}