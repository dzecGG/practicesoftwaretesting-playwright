import { test, expect } from '../../src/fixtures/test';
import { HomePage } from '../../src/pages/HomePage';
import { ProductPage } from '../../src/pages/ProductPage';

test.describe('Products', () => {
  test('a product opens from the home page', { tag: '@smoke' }, async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    const firstProduct = homePage.productNames.first();
    const name = (await firstProduct.innerText()).trim();
    await firstProduct.click();

    const productPage = new ProductPage(page);
    await expect(productPage.name).toHaveText(name);
    await expect(productPage.unitPrice).toBeVisible();
  });

  test('search shows only matching products', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.search('pliers');

    const names = await homePage.productNames.allInnerTexts();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase()).toContain('pliers');
    }
  });
});