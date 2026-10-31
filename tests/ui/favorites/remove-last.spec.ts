// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Remove favorites', () => {
  test('Remove the last favorite returns the empty state', async ({ page, api, newCustomer }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const favoritesPage = new FavoritesPage(page);

    // 1. Fresh customer adds only Pliers; open /account/favorites and click delete.
    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    await productPage.addToFavorites();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' }),
    ).toBeVisible();

    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-my-favorites').click();
    await expect(page).toHaveURL(/\/account\/favorites$/);
    await expect(favoritesPage.title).toHaveText('Favorites');

    await expect(favoritesPage.card('Pliers')).toHaveCount(1);

    // Observed live: no confirmation dialog and no removal toast, so neither is asserted.
    const deleted = await favoritesPage.remove('Pliers');
    expect(deleted.status()).toBe(204);

    await expect(favoritesPage.cards).toHaveCount(0);
    await expect(favoritesPage.emptyMessage).toBeVisible();

    // 2. Reload the page.
    const favoritesResponse = await favoritesPage.reloadAndWaitForList();
    expect(favoritesResponse.ok()).toBe(true);
    expect(await favoritesResponse.json()).toEqual([]);

    await expect(favoritesPage.emptyMessage).toBeVisible();
    await expect(favoritesPage.cards).toHaveCount(0);
  });
});
