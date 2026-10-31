import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly productNames: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;

  constructor(private readonly page: Page) {
    this.productNames = page.getByTestId('product-name');
    this.searchBox = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.productNames.first()).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.searchButton.click();
    // The page marks its product list with this once the search has finished
    await expect(this.page.getByTestId('search_completed')).toBeAttached();
  }
}