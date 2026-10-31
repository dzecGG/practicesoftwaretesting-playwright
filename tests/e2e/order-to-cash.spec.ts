import { test, expect } from '../../src/fixtures/test';
import { signInWithToken } from '../../src/auth';
import { ProductPage } from '../../src/pages/ProductPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { AdminOrderPage } from '../../src/pages/AdminOrderPage';

test('order to cash: a customer order is invoiced and shipped', { tag: '@smoke' }, async ({
  page,
  adminPage,
  api,
  newCustomer,
}) => {
  const product = await api.firstProductInStock();
  const customerApi = api.as(newCustomer.token);
  await signInWithToken(page, newCustomer.token);

  const { invoiceNumber, totalAtCheckout } = await test.step('customer orders one item', async () => {
    const productPage = new ProductPage(page);
    await productPage.goto(product.id);
    await productPage.addToCart();

    const checkout = new CheckoutPage(page);
    await checkout.openFromHeader();
    const totalAtCheckout = await checkout.total();
    const invoiceNumber = await checkout.payCashOnDelivery();
    return { invoiceNumber, totalAtCheckout };
  });

  const invoice = await test.step('the invoice matches the checkout', async () => {
    const invoice = await customerApi.findInvoice(invoiceNumber);
    expect(invoice.total).toBeCloseTo(totalAtCheckout, 2);
    expect(invoice.status).toBe('AWAITING_FULFILLMENT');
    return invoice;
  });

  await test.step('admin marks the order as shipped', async () => {
    const orderPage = new AdminOrderPage(adminPage);
    await orderPage.goto(invoice.id, invoiceNumber);
    await orderPage.setStatus('SHIPPED');
  });

  await test.step('the customer sees the new status', async () => {
    const response = await customerApi.getInvoice(invoice.id);
    await expect(response).toBeOK();
    expect(await response.json()).toMatchObject({ invoice_number: invoiceNumber, status: 'SHIPPED' });
  });
});