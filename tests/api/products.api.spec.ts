import { test, expect } from '../../src/fixtures/test';
import type { Paged, Product } from '../../src/api/ApiClient';

test.describe('Products API', () => {
  test('lists products with paging details', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.getProducts();
    await expect(response).toBeOK();

    const body: Paged<Product> = await response.json();
    expect(body.current_page).toBe(1);
    expect(body.data.length).toBeGreaterThan(0);
    for (const product of body.data) {
      expect(product).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
      });
    }
  });

  test('sorts by price, lowest first', async ({ api }) => {
    const response = await api.getProducts({ sort: 'price,asc' });
    await expect(response).toBeOK();

    const prices = ((await response.json()) as Paged<Product>).data.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('a single product matches the list', async ({ api }) => {
    const listed = await api.firstProductInStock();

    const response = await api.getProduct(listed.id);
    await expect(response).toBeOK();
    expect(await response.json()).toMatchObject({ id: listed.id, name: listed.name, price: listed.price });
  });

  test('an unknown product returns 404', async ({ api }) => {
    const response = await api.getProduct('does-not-exist');
    expect(response.status()).toBe(404);
  });
});