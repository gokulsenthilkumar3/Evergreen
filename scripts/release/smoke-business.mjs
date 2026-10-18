import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

export function httpClient(origin, account) {
  let token;
  return async function request(method, route, body) {
    const response = await fetch(origin + '/api/backend' + route, { method, signal: AbortSignal.timeout(30_000),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(`${method} ${route} returned ${response.status}: ${JSON.stringify(result.message || 'request failed')}`);
    if (route === '/auth/login') token = result.access_token;
    return result;
  };
}

export async function seedBusiness(request, account) {
  await request('POST', '/auth/login', account);
  // Synthetic company identity is confined to this disposable installation.
  await request('PUT', '/settings', { companyName: 'Release acceptance fixture', address: 'Synthetic test data only', gstin: '33AAAAA0000A1Z5' });
  const customer = await request('POST', '/commerce/customers', { name: 'Release fixture customer' });
  const item = await request('POST', '/commerce/items', { name: 'Release fixture yarn', sku: 'RELEASE-FIXTURE', type: 'YARN', uom: 'KG', salePrice: 100, costPrice: 50 });
  await request('POST', `/commerce/items/${item.id}/adjust`, { quantity: 10, notes: 'Disposable release fixture' });
  const invoice = await request('POST', '/commerce/invoices', { customerId: customer.id, requestKey: randomUUID(), lines: [{ itemId: item.id, quantity: 2, rate: 100, gstRate: 0 }] });
  assert.equal(invoice.total, 200);
  await request('POST', `/commerce/invoices/${invoice.id}/payments`, { amount: 75, method: 'CASH', idempotencyKey: randomUUID() });
  const state = await readBusiness(request);
  assert.equal(state.invoices[0].amountPaid, 75);
  assert.equal(state.customers[0].balance, 125);
  return state;
}

export async function readBusiness(request) {
  return { items: await request('GET', '/commerce/items'), invoices: await request('GET', '/commerce/invoices'), customers: await request('GET', '/commerce/customers') };
}
