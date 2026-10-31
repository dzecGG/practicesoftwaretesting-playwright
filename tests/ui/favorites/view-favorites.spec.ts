// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('View favorites', () => {
  test('Favorited product appears under My account > Favorites via menu', async ({ page, api, newCustomer }) => {
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
    await page.getByTestId('add-to-favorites').click();
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
    await expect(page.getByRole('heading', { name: 'Favorites', exact: true })).toBeVisible();

    const card = favoritesPage.card('Pliers');
    await expect(card).toHaveCount(1);
    await expect(card.getByRole('img')).toBeVisible();
    await expect(card.getByRole('heading', { name: 'Pliers', exact: true })).toBeVisible();
    await expect(card.getByTestId('product-description')).toHaveText(/\.\.\.$/);
    await expect(card.getByTestId('delete')).toBeVisible();
    await expect(card.getByTestId('delete')).toHaveText('');
  });
});
