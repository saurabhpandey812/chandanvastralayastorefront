import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address, CartItem, Order } from '@/types/product';
import { api } from '@/lib/api';
import { mapApiOrder, type ApiOrder } from '@/lib/mapOrder';

interface OrderState {
  address: Address | null;
  orders: Order[];
  lastOrderId: string | null;
  saveAddress: (address: Address) => void;
  recordOrder: (order: Order) => void;
  fetchOrders: () => Promise<void>;
  getOrder: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      address: null,
      orders: [],
      lastOrderId: null,

      saveAddress: (address) => set({ address }),

      recordOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders.filter((item) => item.id !== order.id)],
          lastOrderId: order.id,
        })),

      fetchOrders: async () => {
        const res = await api<{ orders?: ApiOrder[] | Order[] }>('/api/orders');
        if (!res.ok || !Array.isArray(res.data.orders)) return;
        const mapped = res.data.orders.map((row) =>
          'orderNumber' in row || '_id' in row ? mapApiOrder(row as ApiOrder, get().address) : (row as Order)
        );
        const local = get().orders;
        const byId = new Map<string, Order>();
        [...mapped, ...local].forEach((order) => {
          if (!byId.has(order.id)) byId.set(order.id, order);
        });
        set({ orders: [...byId.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) });
      },

      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: 'chandan-orders' }
  )
);

export function buildLocalOrder(input: {
  id?: string;
  items: CartItem[];
  address: Address;
  paymentMethod: string;
  couponCode?: string;
  discount: number;
  subtotal: number;
  total: number;
}): Order {
  return {
    id: input.id || `AAR${Date.now().toString().slice(-8)}`,
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
}
