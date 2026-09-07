'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Tag,
  ChevronRight,
  X,
} from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import { getProductBySlug, getSimilarProducts } from '@/lib/data/products';
import { pincodeError } from '@/lib/validation';
import { discountPercent, formatInr } from '@/lib/format';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHydrated } from '@/store/hydrate';
import { Product } from '@/types/product';

const categoryCrumbs: Record<string, string> = {
  men: 'Men Clothing',
  women: 'Women Clothing',
  kids: 'Kids Clothing',
  ethnic: 'Ethnic Wear',
};

function ratingSplit(rating: number, total: number) {
  const weights = [
    Math.max(rating - 4, 0.15),
    Math.max(rating - 3, 0.2),
    0.18,
    0.08,
    0.05,
  ];
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => Math.max(1, Math.round((w / sum) * total)));
}

function sizeRows(product: Product) {
  if (product.sizes.some((s) => s.includes('Y'))) {
    return product.sizes.map((s) => [s, '—', '—', 'Regular kids']);
  }
  if (product.sizes.every((s) => /^\d+$/.test(s))) {
    return product.sizes.map((s) => [s, `${s} in`, `${Number(s) + 8} in`, product.fit]);
  }
  const chest: Record<string, string> = {
    XS: '34',
    S: '36',
    M: '38',
    L: '40',
    XL: '42',
    XXL: '44',
  };
  return product.sizes.map((s) => [s, chest[s] ? `${chest[s]} in` : '—', '—', product.fit]);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) =>
    product ? s.items.some((p) => p.id === product.id) : false
  );
  const hydrated = useHydrated((s) => s.hydrated);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [pinOk, setPinOk] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  const similar = useMemo(
    () => (product ? getSimilarProducts(product, 5) : []),
    [product]
  );

  if (!product) {
    return (
      <div className="max-w-content mx-auto px-6 py-24 text-center bg-white">
        <p className="text-ink font-bold">This product could not be found.</p>
        <Link href="/products/all" className="text-myntra text-sm font-bold mt-3 inline-block">
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.mrp);
  const isWished = hydrated && wished;
  const bars = ratingSplit(product.rating, product.ratingCount);
  const specs: [string, string][] = [
    ['Fit', product.fit.split('.')[0]],
    ['Color', product.colors.join(', ')],
    ['Occasion', product.category === 'ethnic' ? 'Festive' : 'Casual'],
    ['Material', product.material.split('.')[0]],
    ['Length / Rise', product.fit],
    ['Product Code', `AAR${product.id.padStart(7, '0')}`],
  ];

  function handleAddToBag() {
    if (!selectedSize) {
      setError('Please select a size');
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setError('');
    addItem(product!, selectedSize);
    setAdded(true);
  }

  function checkPin() {
    const err = pincodeError(pincode);
    if (err) {
      setPinOk(false);
      setPinMsg(err);
      return;
    }
    setPinOk(true);
    const date = new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    setPinMsg(`Get it by ${date}`);
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-store mx-auto px-4 pt-4 text-[12px] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/products/all" className="hover:text-ink">Clothing</Link>
        <span className="mx-1">/</span>
        <Link href={`/products/${product.category}`} className="hover:text-ink">
          {categoryCrumbs[product.category]}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-ink">{product.subcategory}</span>
      </div>

      <div className="max-w-store mx-auto px-4 py-5 grid lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] gap-8 items-start">
        <div className="grid grid-cols-2 gap-2">
          {product.images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setZoom(src)}
              className="group relative aspect-[3/4] overflow-hidden bg-mist"
            >
              <Image
                src={src}
                alt={`${product.name} ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 1024px) 50vw, 30vw"
                priority={i < 2}
              />
              {i === 0 && (
                <Link
                  href="#similar"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide shadow-sm"
                >
                  View similar
                </Link>
              )}
            </button>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 h-fit pb-8">
          <h1 className="text-[24px] leading-tight font-extrabold text-[#282c3f]">{product.brand}</h1>
          <h2 className="text-[20px] font-normal text-[#535665] mt-1">{product.name}</h2>

          <div className="inline-flex items-center gap-1.5 mt-4 border border-[#eaeaec] px-2 py-[3px] text-[14px] font-bold text-[#282c3f]">
            {product.rating.toFixed(1)}
            <Star size={12} className="fill-[#14958f] text-[#14958f]" />
            <span className="text-[#d4d5d9] font-normal">|</span>
            <span className="text-[#535766] font-semibold">
              {product.ratingCount.toLocaleString('en-IN')} Ratings
            </span>
          </div>

          <div className="border-t border-[#d4d5d9] mt-4 pt-4">
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
              <span className="text-[24px] font-extrabold text-[#282c3f]">{formatInr(product.price)}</span>
              <span className="text-[16px] text-[#535665]">
                MRP <span className="line-through">{formatInr(product.mrp)}</span>
              </span>
              <span className="text-[16px] font-bold text-[#ff905a]">({discount}% OFF)</span>
            </div>
            <p className="text-[14px] text-[#03a685] font-bold mt-1">inclusive of all taxes</p>
          </div>

          <div ref={sizeRef} className="mt-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[16px] font-bold uppercase tracking-wide text-[#282c3f]">
                Select Size
              </p>
              <button
                type="button"
                onClick={() => setChartOpen(true)}
                className="text-[14px] font-bold text-[#ff3f6c] flex items-center gap-0.5"
              >
                SIZE CHART <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setError('');
                    setAdded(false);
                  }}
                  className={`min-w-[50px] h-[50px] px-3 rounded-full border text-[14px] font-bold transition-colors ${
                    selectedSize === size
                      ? 'border-[#ff3f6c] text-[#ff3f6c]'
                      : error
                        ? 'border-[#ff3f6c] text-[#282c3f]'
                        : 'border-[#bfc0c6] text-[#282c3f] hover:border-[#282c3f]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {error && <p className="text-[14px] text-[#ff3f6c] mt-2 font-semibold">{error}</p>}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleAddToBag}
              className="flex-[1.3] h-[50px] rounded-sm bg-[#ff3f6c] hover:bg-[#e63660] text-white text-[14px] font-bold uppercase tracking-wide inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              {added ? 'Added to bag' : 'Add to bag'}
            </button>
            <button
              type="button"
              onClick={() => toggleWish(product)}
              className="flex-1 h-[50px] rounded-sm border border-[#d4d5d9] bg-white text-[#282c3f] text-[14px] font-bold uppercase tracking-wide inline-flex items-center justify-center gap-2 hover:border-[#282c3f]"
            >
              <Heart size={18} className={isWished ? 'fill-[#ff3f6c] text-[#ff3f6c]' : ''} />
              {isWished ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
          {added && (
            <button
              type="button"
              onClick={() => router.push('/cart')}
              className="mt-3 text-[13px] font-bold text-[#ff3f6c]"
            >
              GO TO BAG →
            </button>
          )}

          <div className="mt-8 pt-5 border-t border-[#d4d5d9]">
            <p className="text-[16px] font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
              Delivery Options <Truck size={18} className="text-[#282c3f]" />
            </p>
            <div className="flex max-w-sm h-11 items-stretch border border-[#d4d5d9] rounded-sm bg-white overflow-hidden">
              <span className="w-10 shrink-0 grid place-items-center text-[#282c3f]" aria-hidden>
                <MapPin size={16} />
              </span>
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter pincode"
                inputMode="numeric"
                maxLength={6}
                className="min-w-0 flex-1 h-full bg-transparent px-1 text-[14px] outline-none"
              />
              <button
                type="button"
                onClick={checkPin}
                className="shrink-0 px-3 border-l border-[#d4d5d9] text-[14px] font-bold text-[#ff3f6c]"
              >
                Check
              </button>
            </div>
            <p className="text-[12px] text-[#94969f] mt-2">
              Please enter PIN code to check delivery time & Pay on Delivery Availability
            </p>
            {pinMsg && (
              <p className={`text-[14px] font-semibold mt-2 ${pinOk ? 'text-[#03a685]' : 'text-[#ff3f6c]'}`}>
                {pinMsg}
              </p>
            )}
            <ul className="mt-4 space-y-2 text-[14px] text-[#282c3f]">
              <li className="flex items-start gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" /> 100% Original Products
              </li>
              <li className="flex items-start gap-2">
                <Tag size={16} className="mt-0.5 shrink-0" /> Pay on delivery might be available
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw size={16} className="mt-0.5 shrink-0" /> Easy 14 days returns and exchanges
              </li>
              <li className="flex items-start gap-2">
                <Truck size={16} className="mt-0.5 shrink-0" /> Try & Buy might be available
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t border-[#d4d5d9]">
            <p className="text-[16px] font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
              Best Offers <Tag size={18} />
            </p>
            <div className="space-y-3 text-[13px]">
              {[
                ['Bank Offer', '10% Instant Discount on HDFC Bank Credit Card. Min spend ₹3,000.'],
                ['Coupon', 'Use AARAISH200 and get ₹200 off on orders above ₹1,499.'],
                ['Festive', 'Use FESTIVE500 and get ₹500 off on orders above ₹2,999.'],
              ].map(([title, body]) => (
                <div key={title} className="border border-[#eaeaec] p-3">
                  <p className="font-bold text-[#282c3f]">{title}</p>
                  <p className="text-[#535766] mt-0.5">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-[#d4d5d9] text-[14px] text-[#282c3f] space-y-5">
            <div>
              <p className="font-bold uppercase tracking-wide mb-2">Product Details</p>
              <p className="text-[#535766] leading-relaxed">{product.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                {specs.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[#94969f]">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wide mb-1">Size & Fit</p>
              <p className="text-[#535766]">{product.fit}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wide mb-1">Material & Care</p>
              <p className="text-[#535766]">{product.material}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wide mb-1">Sold By</p>
              <p className="text-[#535766]">{product.seller}</p>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-[#d4d5d9]">
            <p className="text-[16px] font-bold uppercase tracking-wide mb-4">
              Ratings & Reviews
            </p>
            <div className="flex gap-8 items-start">
              <div className="text-center">
                <p className="text-[40px] font-extrabold leading-none flex items-center justify-center gap-1">
                  {product.rating.toFixed(1)}
                  <Star size={22} className="fill-[#14958f] text-[#14958f]" />
                </p>
                <p className="text-[12px] text-[#535766] mt-2">
                  {product.ratingCount.toLocaleString('en-IN')} Verified Buyers
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star, i) => (
                  <div key={star} className="flex items-center gap-2 text-[12px] text-[#535766]">
                    <span className="w-4">{star}</span>
                    <Star size={10} />
                    <div className="flex-1 h-1.5 bg-[#f5f5f6] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#14958f]"
                        style={{ width: `${Math.min(100, (bars[i] / product.ratingCount) * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right">{bars[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ['Great fit and quality', 'Fabric feels premium. Colour is exactly as shown. Would buy again.'],
                ['Value for money', 'Wash is holding up well after two washes. Size is true to chart.'],
              ].map(([title, body]) => (
                <div key={title} className="border-t border-[#eaeaec] pt-4">
                  <p className="text-[13px] font-bold flex items-center gap-2">
                    <span className="bg-[#14958f] text-white text-[11px] px-1.5 py-0.5 rounded-sm">
                      {product.rating.toFixed(1)} ★
                    </span>
                    {title}
                  </p>
                  <p className="text-[13px] text-[#535766] mt-1">{body}</p>
                  <p className="text-[11px] text-[#94969f] mt-2">Verified Buyer · 12 days ago</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section id="similar" className="max-w-store mx-auto px-4 pb-16 pt-4 border-t border-[#eaeaec]">
        <h2 className="text-[16px] font-extrabold uppercase tracking-wide mb-6">Similar Products</h2>
        <ProductGrid products={similar} />
      </section>

      {chartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setChartOpen(false)}>
          <div className="bg-white w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-[16px]">{product.brand} Size Chart</p>
              <button type="button" onClick={() => setChartOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#f5f5f6] text-left">
                  <th className="p-2 font-bold">Size</th>
                  <th className="p-2 font-bold">Chest / Waist</th>
                  <th className="p-2 font-bold">Hip</th>
                  <th className="p-2 font-bold">Fit</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows(product).map((row) => (
                  <tr key={row[0]} className="border-t border-[#eaeaec]">
                    {row.map((cell, idx) => (
                      <td key={`${row[0]}-${idx}`} className="p-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[12px] text-[#94969f] mt-3">{product.fit}</p>
          </div>
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setZoom(null)}>
          <div className="relative w-full max-w-2xl aspect-[3/4]">
            <Image src={zoom} alt={product.name} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
