import { test, expect } from '../../src/fixtures/test';
import { buildCustomer } from '../../src/data/customers';

test.describe('Users API', () => {
  test('login returns a bearer token', { tag: '@smoke' }, async ({ api, newCustomer }) => {
    const response = await api.login(newCustomer.email, newCustomer.password);
    await expect(response).toBeOK();

    expect(await response.json()).toMatchObject({
      access_token: expect.any(String),
      token_type: 'bearer',
      expires_in: expect.any(Number),
    });
  });

  test('registering the same email twice is rejected', async ({ api, newCustomer }) => {
    const duplicate = buildCustomer();
    duplicate.email = newCustomer.email;

    const response = await api.register(duplicate);
    expect(response.status()).toBe(409);
  });

  test('a weak password is rejected', async ({ api }) => {
    const customer = buildCustomer();
    customer.password = 'password';

    const response = await api.register(customer);
    expect(response.status()).toBe(422);
  });

  test('an account locks after three wrong passwords', async ({ api, newCustomer }) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await api.login(newCustomer.email, 'Wrong-password-1!');
      expect(response.status(), `wrong password, attempt ${attempt}`).toBe(401);
    }

    const response = await api.login(newCustomer.email, newCustomer.password);
    expect(response.status()).toBe(423);
  });
});