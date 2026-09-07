'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useHydrated } from '@/store/hydrate';
import { discountPercent, formatInr } from '@/lib/format';
import { Product } from '@/types/product';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const hydrated = useHydrated((s) => s.hydrated);
  const [sizeFor, setSizeFor] = useState<string | null>(null);

  if (!hydrated) {
    return <div className="max-w-content mx-auto px-6 py-20 text-muted">Loading wishlist...</div>;
  }

  function moveToBag(product: Product, size: string) {
    addItem(product, size);
    remove(product.id);
    setSizeFor(null);
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-store mx-auto px-4 py-8">
        <h1 className="text-[18px] font-bold">
          My Wishlist <span className="font-normal text-muted">{items.length} items</span>
        </h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <Heart className="mx-auto text-line" size={48} />
            <p className="mt-4 font-bold">Your wishlist is empty</p>
            <p className="text-sm text-muted mt-1">Save looks you love and move them to bag later.</p>
            <Link
              href="/products/all"
              className="inline-flex mt-6 px-6 py-3 bg-myntra text-white text-sm font-bold uppercase"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {items.map((product) => {
              const discount = discountPercent(product.price, product.mrp);
              return (
                <div key={product.id} className="border border-line relative">
                  <button
                    onClick={() => remove(product.id)}
                    className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-white text-ink-soft text-xs font-bold"
                  >
                    ×
                  </button>
                  <Link href={`/products/item/${product.slug}`}>
                    <div className="relative aspect-[3/4] bg-mist">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="p-2 text-center">
                      <p className="text-[13px] font-bold truncate">{product.brand}</p>
                      <p className="text-[12px] text-ink-soft truncate">{product.name}</p>
                      <p className="text-[13px] mt-1">
                        <span className="font-bold">{formatInr(product.price)}</span>{' '}
                        <span className="text-muted line-through text-[11px]">{formatInr(product.mrp)}</span>{' '}
                        <span className="text-orange text-[11px]">({discount}% OFF)</span>
                      </p>
                    </div>
                  </Link>
                  {sizeFor === product.id ? (
                    <div className="p-2 border-t border-line">
                      <p className="text-[11px] font-bold mb-2">Select size</p>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => moveToBag(product, size)}
                            className="h-8 min-w-[32px] px-2 border border-line text-[11px] font-bold hover:border-myntra hover:text-myntra"
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSizeFor(product.id)}
                      className="w-full py-2.5 border-t border-line text-[13px] font-bold text-myntra uppercase"
                    >
                      Move to bag
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
