import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export type Paged<T> = { current_page: number; last_page: number; total: number; data: T[] };
export type Product = { id: string; name: string; price: number; in_stock: boolean; is_rental: boolean };
export type InvoiceStatus = 'AWAITING_FULFILLMENT' | 'ON_HOLD' | 'AWAITING_SHIPMENT' | 'SHIPPED' | 'COMPLETED';
export type Invoice = { id: string; invoice_number: string; status: InvoiceStatus; total: number };
export type Address = { street: string; city: string; state: string };

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  // A copy of this client that sends the given login token
  as(token: string): ApiClient {
    return new ApiClient(this.request, token);
  }

  private get headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // Raw calls: they return the response, so tests can check any status code

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/users/login', { data: { email, password } });
  }

  register(customer: object): Promise<APIResponse> {
    return this.request.post('/users/register', { data: customer });
  }

  getProducts(params: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get('/products', { params });
  }

  getProduct(id: string): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }

  getInvoice(id: string): Promise<APIResponse> {
    return this.request.get(`/invoices/${id}`, { headers: this.headers });
  }

  searchInvoices(query: string): Promise<APIResponse> {
    return this.request.get('/invoices/search', { params: { q: query }, headers: this.headers });
  }

  updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<APIResponse> {
    return this.request.put(`/invoices/${id}/status`, { headers: this.headers, data: { status } });
  }

  // Helpers: they check the call worked and return the useful part

  async tokenFor(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    await expect(response, `log in as ${email}`).toBeOK();
    const body = await response.json();
    return body.access_token;
  }

  // The site checks that city and state belong to the postal code,
  // so ask its own lookup. Returns null if the lookup isn't available.
  async lookupAddress(country: string, postcode: string): Promise<Address | null> {
    const response = await this.request.get('/postcode-lookup', { params: { country, postcode } });
    if (!response.ok()) return null;
    const { street, city, state } = await response.json();
    return { street, city, state };
  }

  async firstProductInStock(): Promise<Product> {
    const response = await this.getProducts({ is_rental: 'false' });
    await expect(response).toBeOK();
    const page: Paged<Product> = await response.json();
    const product = page.data.find((p) => p.in_stock);
    expect(product, 'an in-stock product on page 1').toBeDefined();
    return product!;
  }

  async findInvoice(invoiceNumber: string): Promise<Invoice> {
    const response = await this.searchInvoices(invoiceNumber);
    await expect(response).toBeOK();
    const page: Paged<Invoice> = await response.json();
    const invoice = page.data.find((i) => i.invoice_number === invoiceNumber);
    expect(invoice, `invoice ${invoiceNumber}`).toBeDefined();
    return invoice!;
  }
}