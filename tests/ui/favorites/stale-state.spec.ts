// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Remove favorites', () => {
  test('Removed product can still be favorited from another tab / stale page', async ({ page, api, newCustomer }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    // 1. In tab 1 open the Pliers detail page.
    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    await expect(productPage.addToFavoritesButton).toBeVisible();

    // In tab 2 (same session) add Pliers and then remove it from favorites.
    const tab2 = await page.context().newPage();
    const tab2ProductPage = new ProductPage(tab2);
    const tab2FavoritesPage = new FavoritesPage(tab2);
    await tab2.goto(`/product/${pliers!.id}`);
    await expect(tab2.getByTestId('nav-menu')).toBeVisible();

    const tab2Added = tab2.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' });
    await tab2ProductPage.addToFavorites();
    await expect(tab2Added).toBeVisible();

    await tab2FavoritesPage.goto();
    await expect(tab2FavoritesPage.title).toHaveText('Favorites');
    const tab2PliersCard = tab2FavoritesPage.card('Pliers');
    await expect(tab2PliersCard).toHaveCount(1);

    const deleted = await tab2FavoritesPage.remove('Pliers');
    expect(deleted.status()).toBe(204);
    await expect(tab2PliersCard).toHaveCount(0);

    // Back in tab 1 (no reload) click 'Add to favourites'.
    await page.bringToFront();
    await productPage.addToFavorites();
    const addedToast = page.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' });
    const alreadyToast = page.getByRole('alert').filter({ hasText: 'Product already in your favorites list.' });
    await expect(addedToast).toBeVisible();
    await expect(alreadyToast).toHaveCount(0);

    // Pliers is in /account/favorites exactly once.
    const favoritesPage = new FavoritesPage(page);
    await favoritesPage.goto();
    await expect(favoritesPage.title).toHaveText('Favorites');
    await expect(favoritesPage.card('Pliers')).toHaveCount(1);
  });
});
