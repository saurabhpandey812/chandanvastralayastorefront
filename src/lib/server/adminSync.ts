import { ADMIN_URL, STORE_KEY } from '@/lib/constants';

export async function syncRegisteredCustomer(input: {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}) {
  await post('/api/store/customers', input);
}

export async function syncCustomerOrder(input: {
  email: string;
  name: string;
  mobile: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  total: number;
}) {
  await post('/api/store/orders', input);
}

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
    // best-effort
  }
}
