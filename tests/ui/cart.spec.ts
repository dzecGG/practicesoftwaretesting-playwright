import { test, expect } from '../../src/fixtures/test';
import { ProductPage } from '../../src/pages/ProductPage';

test('the cart lists a product added from its page', async ({ page, api }) => {
  const product = await api.firstProductInStock();

  const productPage = new ProductPage(page);
  await productPage.goto(product.id);
  await productPage.addToCart();

  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('product-title')).toContainText(product.name);
});