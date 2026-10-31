// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('View favorites', () => {
  test('Favorited product appears under My account > Favorites via menu', async ({ page, api, newCustomer, browserName }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    await productPage.addToFavorites();
    await expect(page.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' })).toBeVisible();

    // 1. After adding Pliers, click the user name in the navbar (nav-menu).
    await page.getByTestId('nav-menu').click();
    await expect(page.getByTestId('nav-my-account')).toBeVisible();
    await expect(page.getByTestId('nav-my-favorites')).toBeVisible();
    await expect(page.getByTestId('nav-my-profile')).toBeVisible();
    await expect(page.getByTestId('nav-my-invoices')).toBeVisible();
    await expect(page.getByTestId('nav-my-messages')).toBeVisible();
    await expect(page.getByTestId('nav-sign-out')).toBeVisible();

    // 2. Click 'My favorites'.
    await page.getByTestId('nav-my-favorites').click();
    await expect(page).toHaveURL(/\/account\/favorites$/);
    await expect(page).toHaveTitle(/^Favorites/);
    const favoritesPage = new FavoritesPage(page);
    await expect(favoritesPage.title).toHaveText('Favorites');
    await expect(favoritesPage.heading).toBeVisible();

    await expect(favoritesPage.card('Pliers')).toHaveCount(1);
    // Playwright's WebKit can't decode the site's AVIF images, so the img has no size and counts as hidden
    if (browserName === 'webkit') {
      await expect(favoritesPage.cardImage('Pliers')).toBeAttached();
      await expect(favoritesPage.cardImage('Pliers')).toHaveAttribute('alt', 'Pliers');
    } else {
      await expect(favoritesPage.cardImage('Pliers')).toBeVisible();
    }
    await expect(favoritesPage.cardName('Pliers')).toBeVisible();
    await expect(favoritesPage.cardDescription('Pliers')).toHaveText(/\.\.\.$/);
    await expect(favoritesPage.deleteButton('Pliers')).toBeVisible();
    await expect(favoritesPage.deleteButton('Pliers')).toHaveText('');
  });
});
