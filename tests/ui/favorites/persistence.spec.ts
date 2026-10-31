// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Add to favorites', () => {
  test('Favorite persists across logout/login and reload', async ({ page, api, newCustomer }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    // 1. Add Pliers as a fresh customer, sign out via the user menu (Sign out), log in again with the same account, open /account/favorites.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    await page.getByTestId('add-to-favorites').click();
    await expect(page.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' })).toBeVisible();

    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-sign-out').click();
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    await expect(page.getByTestId('nav-menu')).toHaveCount(0);

    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const favoritesPage = new FavoritesPage(page);
    await favoritesPage.goto();
    await expect(favoritesPage.card('Pliers')).toHaveCount(1);

    // 2. Reload the favorites page.
    await favoritesPage.reload();
    await expect(favoritesPage.card('Pliers')).toHaveCount(1);
  });
});
