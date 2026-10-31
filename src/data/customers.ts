import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';
import type { ApiClient } from '../api/ApiClient';

export type CustomerData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  address: { street: string; house_number: string; city: string; state: string; country: string; postal_code: string };
};

export type RegisteredCustomer = CustomerData & { token: string };

export function buildCustomer(address: Partial<CustomerData['address']> = {}): CustomerData {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName().slice(0, 20),
    // A unique address every run, so tests never share an account
    email: `pw.${Date.now()}.${faker.string.alphanumeric(6).toLowerCase()}@example.com`,
    // The site wants upper case, lower case, a number and a symbol
    password: `${faker.internet.password({ length: 12 })}Aa1!`,
    dob: faker.date.birthdate({ mode: 'age', min: 25, max: 60 }).toISOString().slice(0, 10),
    address: {
      street: faker.location.street(),
      // Checkout won't continue without a house number
      house_number: faker.location.buildingNumber(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'US',
      postal_code: faker.location.zipCode('#####'),
      ...address,
    },
  };
}

export async function registerNewCustomer(api: ApiClient): Promise<RegisteredCustomer> {
  const postal_code = faker.location.zipCode('#####');
  const lookedUp = await api.lookupAddress('US', postal_code);
  const customer = buildCustomer({ postal_code, ...lookedUp });

  const response = await api.register(customer);
  await expect(response, `register ${customer.email}`).toBeOK();

  const token = await api.tokenFor(customer.email, customer.password);
  return { ...customer, token };
}