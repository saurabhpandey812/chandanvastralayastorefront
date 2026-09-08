import { Product } from '@/types/product';
import { jsonFile } from './jsonFile';

const store = jsonFile<Record<string, Product[]>>('wishlists.json', {});

export async function getWishlist(userId: string) {
  const all = await store.read();
  return all[userId] || [];
}

export async function toggleWishlist(userId: string, product: Product) {
  let items: Product[] = [];
  await store.update((all) => {
    const current = all[userId] || [];
    const exists = current.some((p) => p.id === product.id);
    items = exists ? current.filter((p) => p.id !== product.id) : [...current, product];
    return { ...all, [userId]: items };
  });
  return items;
}

export async function removeWishlist(userId: string, productId: string) {
  let items: Product[] = [];
  await store.update((all) => {
    items = (all[userId] || []).filter((p) => p.id !== productId);
    return { ...all, [userId]: items };
  });
  return items;
}
