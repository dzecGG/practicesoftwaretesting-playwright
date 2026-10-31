import { expect, type Locator, type Page } from '@playwright/test';
import type { InvoiceStatus } from '../api/ApiClient';

export class AdminOrderPage {
  readonly invoiceNumber: Locator;
  readonly status: Locator;
  readonly updateStatusButton: Locator;

  constructor(private readonly page: Page) {
    this.invoiceNumber = page.getByTestId('invoice-number');
    this.status = page.getByTestId('order-status');
    this.updateStatusButton = page.getByTestId('update-status-submit');
  }

  async goto(invoiceId: string, invoiceNumber: string): Promise<void> {
    await this.page.goto(`/admin/orders/edit/${invoiceId}`);
    await expect(this.invoiceNumber).toHaveValue(invoiceNumber);
  }

  async setStatus(status: InvoiceStatus): Promise<void> {
    await this.status.selectOption(status);
    await this.updateStatusButton.click();
    await expect(this.page.getByRole('alert').filter({ hasText: 'Status updated!' })).toBeVisible();
  }
}