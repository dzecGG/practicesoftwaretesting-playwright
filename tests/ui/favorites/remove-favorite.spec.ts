// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Remove favorites', () => {
  test('Remove one of several favorites', async ({ page, api, newCustomer }) => {
    const findProduct = async (name: string): Promise<Product> => {
      const response = await api.getProducts({ q: name });
      await expect(response).toBeOK();
      const found: Paged<Product> = await response.json();
      const product = found.data.find((p) => p.name === name);
      expect(product, `the ${name} product`).toBeDefined();
      return product!;
    };
    const pliers = await findProduct('Pliers');
    const slipJoint = await findProduct('Slip Joint Pliers');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const productPage = new ProductPage(page);
    const toast = page.getByRole('alert');

    // 1. Fresh customer adds Pliers and Slip Joint Pliers; open /account/favorites.
    await productPage.goto(pliers.id);
    await productPage.addToFavorites();
    await expect(toast).toHaveText('Product added to your favorites list.');

    // A full navigation discards the first toast, so the next assertion can only match the second one.
    await productPage.goto(slipJoint.id);
    await expect(toast).toHaveCount(0);
    await productPage.addToFavorites();
    await expect(toast).toHaveText('Product added to your favorites list.');

    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-my-favorites').click();
    await expect(page).toHaveURL(/\/account\/favorites$/);
    const favoritesPage = new FavoritesPage(page);
    await expect(favoritesPage.title).toHaveText('Favorites');

    const pliersCard = favoritesPage.card('Pliers');
    const slipJointCard = favoritesPage.card('Slip Joint Pliers');
    await expect(favoritesPage.cards).toHaveCount(2);
    await expect(pliersCard).toHaveCount(1);
    await expect(slipJointCard).toHaveCount(1);

    // 2. Click the delete button on the Pliers card.
    // Observed live: no confirmation dialog and no removal toast, so neither is asserted.
    const deleted = await favoritesPage.remove('Pliers');
    expect(deleted.status()).toBe(204);

    await expect(pliersCard).toHaveCount(0);
    await expect(slipJointCard).toHaveCount(1);
    await expect(favoritesPage.cards).toHaveCount(1);

    // 3. Reload the page.
    const favoritesResponse = await favoritesPage.reloadAndWaitForList();
    expect(favoritesResponse.ok()).toBe(true);

    await expect(favoritesPage.title).toHaveText('Favorites');
    await expect(slipJointCard).toHaveCount(1);
    await expect(pliersCard).toHaveCount(0);
    await expect(favoritesPage.cards).toHaveCount(1);
  });
});
