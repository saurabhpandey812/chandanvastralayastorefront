import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address, CartItem, Order } from '@/types/product';

interface OrderState {
  address: Address | null;
  orders: Order[];
  lastOrderId: string | null;
  saveAddress: (address: Address) => void;
  placeOrder: (payload: {
    items: CartItem[];
    paymentMethod: string;
    couponCode?: string;
    discount: number;
    subtotal: number;
    total: number;
  }) => Order | null;
  getOrder: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      address: null,
      orders: [],
      lastOrderId: null,

      saveAddress: (address) => set({ address }),

      placeOrder: ({ items, paymentMethod, couponCode, discount, subtotal, total }) => {
        const address = get().address;
        if (!address || items.length === 0) return null;
        const order: Order = {
          id: `AAR${Date.now().toString().slice(-8)}`,
          items,
          address,
          paymentMethod,
          couponCode,
          discount,
          subtotal,
          total,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          orders: [order, ...state.orders],
          lastOrderId: order.id,
        }));
        return order;
      },

      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: 'aaraish-orders' }
  )
);
