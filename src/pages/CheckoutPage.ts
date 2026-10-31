import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  readonly cartTotal: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(private readonly page: Page) {
    this.cartTotal = page.getByTestId('cart-total');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  async openFromHeader(): Promise<void> {
    await this.page.getByTestId('nav-cart').click();
    await expect(this.cartTotal).toHaveText(/\$\d/);
  }

  // "$1,234.56" -> 1234.56
  async total(): Promise<number> {
    const text = await this.cartTotal.innerText();
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  // Steps 1 to 4 for a logged-in customer whose address is already saved
  async payCashOnDelivery(): Promise<string> {
    await this.page.getByTestId('proceed-1').click();
    await this.page.getByTestId('proceed-2').click();
    await this.page.getByTestId('proceed-3').click();
    await this.paymentMethod.selectOption('cash-on-delivery');

    // First click: "Check payment" only validates the payment
    await this.finishButton.click();
    await expect(this.paymentSuccess).toHaveText('Payment was successful');
    await expect(this.finishButton).toHaveText('Confirm');

    // Second click: "Confirm" places the order
    await this.finishButton.click();

    // The invoice number has no locator of its own, so read it from the message
    await expect(this.orderConfirmation).toContainText(/INV-\d+/);
    const message = await this.orderConfirmation.innerText();
    return message.match(/INV-\d+/)![0];
  }
}