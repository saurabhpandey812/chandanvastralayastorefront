import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types/product';
import { COUPONS } from '@/lib/coupons';

interface CartState {
  items: CartItem[];
  coupon: string | null;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  moveToWishlistSize: (productId: string, size: string) => CartItem | undefined;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  clearCart: () => void;
  totalItems: () => number;
  totalMrp: () => number;
  totalPrice: () => number;
  couponDiscount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, size) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id && item.size === size
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.size === size
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, size, quantity: 1 }] };
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        })),

      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product.id === productId && item.size === size
                ? { ...item, quantity: Math.min(5, Math.max(1, Math.floor(Number(quantity) || 1))) }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      moveToWishlistSize: (productId, size) => {
        const item = get().items.find(
          (i) => i.product.id === productId && i.size === size
        );
        if (item) get().removeItem(productId, size);
        return item;
      },

      applyCoupon: (code) => {
        const upper = code.trim().toUpperCase();
        const deal = COUPONS[upper];
        if (!deal) return false;
        if (get().totalPrice() < deal.min) return false;
        set({ coupon: upper });
        return true;
      },

      clearCoupon: () => set({ coupon: null }),

      clearCart: () => set({ items: [], coupon: null }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalMrp: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.mrp * item.quantity,
          0
        ),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),

      couponDiscount: () => {
        const code = get().coupon;
        if (!code || !COUPONS[code]) return 0;
        const deal = COUPONS[code];
        return get().totalPrice() >= deal.min ? deal.off : 0;
      },
    }),
    { name: 'chandan-bag' }
  )
);

export const COUPON_LIST = COUPONS;
