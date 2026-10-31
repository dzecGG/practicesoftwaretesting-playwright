// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { registerNewCustomer } from '../../../src/data/customers';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('View favorites', () => {
  test('Favorites are per user', async ({ page, api, newCustomer }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    const userB = await registerNewCustomer(api);

    // 1. User A adds Pliers. Sign out and log in as new user B; open /account/favorites.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    await productPage.addToFavorites();
    await expect(page.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' })).toBeVisible();

    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-sign-out').click();
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    await expect(page.getByTestId('nav-menu')).toHaveCount(0);

    await loginPage.goto();
    await loginPage.login(userB.email, userB.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const favoritesPage = new FavoritesPage(page);
    const favoritesResponse = await favoritesPage.gotoAndWaitForList();
    expect(favoritesResponse.ok()).toBe(true);
    expect(await favoritesResponse.json()).toEqual([]);

    await expect(favoritesPage.title).toHaveText('Favorites');
    await expect(favoritesPage.emptyMessage).toBeVisible();
    await expect(favoritesPage.cards).toHaveCount(0);
    await expect(favoritesPage.productName('Pliers')).toHaveCount(0);
  });
});
