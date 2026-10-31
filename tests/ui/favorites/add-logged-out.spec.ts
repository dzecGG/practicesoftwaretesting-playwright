// spec: specs/favorites.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../../src/fixtures/test';
import { ProductPage } from '../../../src/pages/ProductPage';
import type { Paged, Product } from '../../../src/api/ApiClient';

test.describe('Add to favorites', () => {
  test('Adding to favorites while logged out is rejected', async ({ page, api }) => {
    const response = await api.getProducts({ q: 'Pliers' });
    await expect(response).toBeOK();
    const found: Paged<Product> = await response.json();
    const pliers = found.data.find((p) => p.name === 'Pliers');
    expect(pliers, 'the Pliers product').toBeDefined();

    // 1. With no session, open the Pliers product page and click 'Add to favourites'.
    const productPage = new ProductPage(page);
    await productPage.goto(pliers!.id);
    const addButton = page.getByTestId('add-to-favorites');
    await expect(addButton).toHaveText('Add to favourites');

    await addButton.click();

    await expect(
      page.getByRole('alert').filter({ hasText: 'Unauthorized, can not add product to your favorite list.' }),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/product/${pliers!.id}$`));
    await expect(addButton).toHaveText('Add to favourites');
    await expect(addButton).toBeEnabled();

    // 2. Navigate directly to /account/favorites while logged out.
    await page.goto('/account/favorites');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
