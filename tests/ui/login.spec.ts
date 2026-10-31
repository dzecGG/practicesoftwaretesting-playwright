import { test, expect } from '../../src/fixtures/test';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Login page', () => {
  test('a registered customer lands on My account', { tag: '@smoke' }, async ({ page, newCustomer }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);

    await expect(page.getByTestId('page-title')).toHaveText('My account');
  });

  test('a wrong password shows an error', async ({ page, newCustomer }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, 'Wrong-password-1!');

    await expect(loginPage.error).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});

test.describe('Signed-in pages', () => {
  test('the saved customer login opens My account', async ({ customerPage }) => {
    await customerPage.goto('/account');
    await expect(customerPage.getByTestId('page-title')).toHaveText('My account');
  });

  test('the saved admin login opens the dashboard', async ({ adminPage }) => {
    await adminPage.goto('/admin/dashboard');
    await expect(adminPage.getByTestId('nav-admin-orders')).toBeAttached();
  });
});