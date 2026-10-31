import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly addToCartButton: Locator;
  readonly cartQuantity: Locator;
  readonly addToFavoritesButton: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.addToFavoritesButton = page.getByTestId('add-to-favorites');
  }

  async goto(productId: string): Promise<void> {
    await this.page.goto(`/product/${productId}`);
    await expect(this.name).toBeVisible();
  }

  async addToCart(expectedItemsInCart = 1): Promise<void> {
    await this.addToCartButton.click();
    await expect(this.cartQuantity).toHaveText(String(expectedItemsInCart));
  }

  // The button never changes state, so callers check the toast
  async addToFavorites(): Promise<void> {
    await this.addToFavoritesButton.click();
  }
}