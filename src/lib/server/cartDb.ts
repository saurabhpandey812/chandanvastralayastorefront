import { CartItem, Product } from '@/types/product';
import { jsonFile } from './jsonFile';
import { getById } from './catalog';

type CartRecord = { userId: string; items: CartItem[]; coupon: string | null };

const store = jsonFile<CartRecord[]>('carts.json', []);

export async function getCart(userId: string) {
  const rows = await store.read();
  return rows.find((r) => r.userId === userId) ?? { userId, items: [], coupon: null };
}

export async function saveCart(cart: CartRecord) {
  await store.update((rows) => {
    const idx = rows.findIndex((r) => r.userId === cart.userId);
    if (idx < 0) return [cart, ...rows];
    const copy = [...rows];
    copy[idx] = cart;
    return copy;
  });
  return cart;
}

export async function addCartItem(userId: string, productId: string, size: string, quantity = 1) {
  const product = await getById(productId);
  if (!product) throw new Error('Product not found');
  if (size && product.sizes.length && !product.sizes.includes(size)) {
    throw new Error(`Size ${size} is not available for this product`);
  }
  const cart = await getCart(userId);
  const existing = cart.items.find((item) => item.product.id === productId && item.size === size);
  const items = existing
    ? cart.items.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    : [...cart.items, { product, size, quantity }];
  return saveCart({ ...cart, items });
}

export async function updateCartItem(userId: string, productId: string, size: string, quantity: number) {
  const cart = await getCart(userId);
  const items =
    quantity <= 0
      ? cart.items.filter((item) => !(item.product.id === productId && item.size === size))
      : cart.items.map((item) =>
          item.product.id === productId && item.size === size ? { ...item, quantity } : item
        );
  return saveCart({ ...cart, items });
}

export async function clearCart(userId: string) {
  return saveCart({ userId, items: [], coupon: null });
}

export async function setCoupon(userId: string, coupon: string | null) {
  const cart = await getCart(userId);
  return saveCart({ ...cart, coupon });
}

export type { Product };
