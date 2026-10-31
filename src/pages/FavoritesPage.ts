import type { Locator, Page, Response } from '@playwright/test';

export class FavoritesPage {
  readonly title: Locator;
  readonly heading: Locator;
  readonly cards: Locator;
  readonly deleteButtons: Locator;
  readonly emptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('page-title');
    this.heading = page.getByRole('heading', { name: 'Favorites', exact: true });
    // A card's test id holds the favorite's id, not the product's, so cards are found by product name
    this.cards = page.getByTestId(/^favorite-/);
    this.deleteButtons = page.getByTestId('delete');
    // The message has no test id
    this.emptyMessage = page.getByText(
      'There are no favorites yet. In order to add favorites, please go to the product listing and mark some products as your favorite.',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/account/favorites');
  }

  // The empty message shows until the list request returns, so these resolve with that response
  async gotoAndWaitForList(): Promise<Response> {
    return this.waitForList(() => this.goto());
  }

  async reloadAndWaitForList(): Promise<Response> {
    return this.waitForList(() => this.page.reload());
  }

  productName(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  card(productName: string): Locator {
    return this.cards.filter({ has: this.productName(productName) });
  }

  cardImage(productName: string): Locator {
    return this.card(productName).getByRole('img');
  }

  cardName(productName: string): Locator {
    return this.card(productName).getByRole('heading', { name: productName, exact: true });
  }

  cardDescription(productName: string): Locator {
    return this.card(productName).getByTestId('product-description');
  }

  deleteButton(productName: string): Locator {
    return this.card(productName).getByTestId('delete');
  }

  // Resolves with the DELETE response
  async remove(productName: string): Promise<Response> {
    const deleted = this.page.waitForResponse(
      (r) => r.request().method() === 'DELETE' && new URL(r.url()).pathname.startsWith('/favorites/'),
    );
    await this.deleteButton(productName).click();
    return deleted;
  }

  private async waitForList(navigate: () => Promise<unknown>): Promise<Response> {
    const loaded = this.page.waitForResponse(
      (r) => r.request().method() === 'GET' && new URL(r.url()).pathname === '/favorites',
    );
    await navigate();
    return loaded;
  }
}
