import { Address, CartItem, Order } from '@/types/product';
import { jsonFile } from './jsonFile';

type StoredOrder = Order & { userId: string };

const store = jsonFile<StoredOrder[]>('orders.json', []);

export async function listOrders(userId: string) {
  const orders = await store.read();
  return orders.filter((o) => o.userId === userId);
}

export async function getOrder(userId: string, id: string) {
  const orders = await store.read();
  return orders.find((o) => o.id === id && o.userId === userId) ?? null;
}

export async function createOrder(input: {
  userId: string;
  items: CartItem[];
  address: Address;
  paymentMethod: string;
  couponCode?: string;
  discount: number;
  subtotal: number;
  total: number;
}) {
  const order: StoredOrder = {
    id: `AAR${Date.now().toString().slice(-8)}`,
    userId: input.userId,
    items: input.items,
    address: input.address,
    paymentMethod: input.paymentMethod,
    couponCode: input.couponCode,
    discount: input.discount,
    subtotal: input.subtotal,
    total: input.total,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  await store.update((orders) => [order, ...orders]);
  return order;
}
