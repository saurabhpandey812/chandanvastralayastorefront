const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
const STORE_KEY = 'aaraish-store-demo';

async function post(path: string, body: unknown) {
  try {
    await fetch(`${ADMIN_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Key': STORE_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Admin sync is best-effort so storefront checkout still works offline.
  }
}

export function syncRegisteredCustomer(input: {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}) {
  return post('/api/store/customers', input);
}

export function syncCustomerOrder(input: {
  email: string;
  name: string;
  mobile: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  total: number;
}) {
  return post('/api/store/orders', input);
}
