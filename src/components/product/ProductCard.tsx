'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types/product';
import { discountPercent, formatInr } from '@/lib/format';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHydrated } from '@/store/hydrate';

export default function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.price, product.mrp);
  const toggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.items.some((p) => p.id === product.id));
  const hydrated = useHydrated((s) => s.hydrated);
  const isWished = hydrated && wished;

  return (
    <article className="group bg-white relative">
      <Link href={`/products/item/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-mist">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-ink">
            {product.rating.toFixed(1)} ★
            <span className="text-muted font-semibold">| {product.ratingCount}</span>
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(product);
        }}
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/95 flex items-center justify-center shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        aria-label="Wishlist"
      >
        <Heart
          size={16}
          className={isWished ? 'fill-myntra text-myntra' : 'text-ink-soft'}
        />
      </button>

      <div className="px-2 pt-3 pb-4">
        <p className="text-[14px] font-bold text-ink truncate">{product.brand}</p>
        <p className="text-[13px] text-ink-soft truncate mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[14px] font-bold text-ink">{formatInr(product.price)}</span>
          <span className="text-[12px] text-muted line-through">{formatInr(product.mrp)}</span>
          <span className="text-[12px] font-semibold text-orange">({discount}% OFF)</span>
        </div>
      </div>
    </article>
  );
}
