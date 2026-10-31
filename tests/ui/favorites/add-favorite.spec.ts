// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Add to favorites', () => {
  test('Add a product to favorites from its detail page (happy path)', async ({ page, api, newCustomer }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    // 1. Log in as a fresh customer and navigate to the Pliers product page
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(page.getByTestId('nav-menu')).toBeVisible();

    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await expect(page.getByTestId('add-to-compare')).toBeVisible();
    await expect(page.getByTestId('add-to-favorites')).toHaveText('Add to favourites');

    // 2. Click 'Add to favourites'
    await page.getByTestId('add-to-favorites').click();

    await expect(page.getByRole('alert')).toHaveText('Product added to your favorites list.');
    await expect(page).toHaveURL(new RegExp(`/product/${pliers!.id}$`));
    await expect(page.getByTestId('add-to-favorites')).toHaveText('Add to favourites');
    await expect(page.getByTestId('add-to-favorites')).toBeEnabled();
  });
});
