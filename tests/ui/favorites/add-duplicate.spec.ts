// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Add to favorites', () => {
  test("Adding the same product twice shows 'already' message and no duplicate", async ({ page, api, newCustomer }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    // 1. As a fresh customer, open Pliers and click 'Add to favourites' twice.
    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    const addButton = page.getByTestId('add-to-favorites');
    const addedToast = page.getByRole('alert').filter({ hasText: 'Product added to your favorites list.' });
    const alreadyToast = page.getByRole('alert').filter({ hasText: 'Product already in your favorites list.' });

    await addButton.click();
    await expect(addedToast).toBeVisible();

    // Both toasts can be on screen at once, so each is matched by its own text.
    await addButton.click();
    await expect(alreadyToast).toBeVisible();
    await expect(addButton).toBeEnabled();

    // 2. Open /account/favorites.
    const favoritesPage = new FavoritesPage(page);
    await favoritesPage.goto();
    await expect(favoritesPage.card('Pliers')).toHaveCount(1);
    await expect(favoritesPage.cards).toHaveCount(1);
  });
});
