// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Remove favorites', () => {
  test('Re-add a product after removing it', async ({ page, api, newCustomer }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const addedToast = page.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' });
    const alreadyToast = page.getByRole('alert').filter({ hasText: 'Product already in your favorites list.' });
    const favoritesPage = new FavoritesPage(page);

    // 1. Add Pliers, remove it from /account/favorites, return to the Pliers product page and click 'Add to favourites'.
    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    await page.getByTestId('add-to-favorites').click();
    await expect(addedToast).toBeVisible();

    await favoritesPage.goto();
    await expect(favoritesPage.card('Pliers')).toHaveCount(1);
    await favoritesPage.remove('Pliers');

    // Full navigation clears the earlier toast.
    await productPage.goto(pliers!.id);
    await page.getByTestId('add-to-favorites').click();
    await expect(addedToast).toBeVisible();
    await expect(alreadyToast).toHaveCount(0);

    // Pliers appears again in /account/favorites.
    await favoritesPage.goto();
    await expect(favoritesPage.card('Pliers')).toHaveCount(1);
  });
});
