// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { FavoritesPage } from '../../../src/pages/FavoritesPage';
import { LoginPage } from '../../../src/pages/LoginPage';

test.describe('View favorites', () => {
  test('Empty favorites state for a new user', async ({ page, newCustomer }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    // 1. Register and log in as a new customer; open /account/favorites.
    const favoritesPage = new FavoritesPage(page);
    const favoritesResponse = await favoritesPage.gotoAndWaitForList();
    expect(favoritesResponse.ok()).toBe(true);
    expect(await favoritesResponse.json()).toEqual([]);

    await expect(page).toHaveURL(/\/account\/favorites$/);
    await expect(favoritesPage.title).toHaveText('Favorites');
    await expect(favoritesPage.emptyMessage).toBeVisible();
    await expect(favoritesPage.cards).toHaveCount(0);
    await expect(favoritesPage.deleteButtons).toHaveCount(0);
  });
});
