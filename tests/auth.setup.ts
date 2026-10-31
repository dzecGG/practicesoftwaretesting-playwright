import { test as setup, expect } from '../src/fixtures/test';
import { LoginPage } from '../src/pages/LoginPage';
import { authFile, requireEnv } from '../src/auth';
import { registerNewCustomer } from '../src/data/customers';

setup('log in as a new customer', async ({ page, api, envName }) => {
  const customer = await registerNewCustomer(api);

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(customer.email, customer.password);
  await expect(page).toHaveURL(/\/account$/);

  await page.context().storageState({ path: authFile(envName, 'customer') });
});

setup('log in as the admin', async ({ page, envName }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(requireEnv('ADMIN_EMAIL'), requireEnv('ADMIN_PASSWORD'));
  await expect(page).toHaveURL(/\/admin\/dashboard$/);

  await page.context().storageState({ path: authFile(envName, 'admin') });
});