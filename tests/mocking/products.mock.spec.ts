import { test, expect } from '../../src/fixtures/test';

// Matches the product list request, whatever HTTP method the site uses
function isProductList(apiURL: string) {
  const api = new URL(apiURL);
  return (url: URL) => url.origin === api.origin && url.pathname === '/products';
}

test.describe('Home page with a faked product API', () => {
  test('shows a message when no products come back', async ({ page, apiURL }) => {
    await page.route(isProductList(apiURL), async (route) => {
      if (route.request().method() === 'OPTIONS') return route.continue();
      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({ response, json: { ...body, data: [], total: 0 } });
    });

    await page.goto('/');
    await expect(page.getByTestId('no-results')).toBeVisible();
  });

test.fail('tells the user when products fail to load', {
  annotation: { type: 'bug', description: 'Home page shows loading placeholders forever, with no error message, when products fail to load' },
}, async ({ page, apiURL }) => {
    await page.route(isProductList(apiURL), async (route) => {
      if (route.request().method() === 'OPTIONS') return route.continue();
      await route.fulfill({
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        json: { message: 'Server error' },
      });
    });

    await page.goto('/');
    await expect(page.getByRole('alert')).toBeVisible();
  });
});