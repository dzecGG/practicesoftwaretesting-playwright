import { test, expect } from '../../src/fixtures/test';

test('the login form looks the same', { tag: '@visual' }, async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByTestId('login-form')).toHaveScreenshot('login-form.png');
});