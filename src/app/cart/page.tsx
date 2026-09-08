'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import PriceDetails from '@/components/checkout/PriceDetails';
import { useCartStore, COUPON_LIST } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';
import { formatInr } from '@/lib/format';
import { couponFormatError, onlyDigits, pincodeError, sanitizeCoupon } from '@/lib/validation';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);
  const coupon = useCartStore((s) => s.coupon);
  const mrp = useCartStore((s) => s.totalMrp());
  const price = useCartStore((s) => s.totalPrice());
  const couponOff = useCartStore((s) => s.couponDiscount());
  const addWish = useWishlistStore((s) => s.add);
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [pincode, setPincode] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [pinOk, setPinOk] = useState(false);

  if (!hydrated) {
    return <div className="max-w-content mx-auto px-6 py-20 text-muted">Loading bag...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-5xl mb-4">🛍️</p>
        <h1 className="text-xl font-bold text-ink">Hey, it feels so light!</h1>
        <p className="text-sm text-muted mt-2">
          There is nothing in your bag. Let&apos;s add some items.
        </p>
        <Link
          href="/wishlist"
          className="inline-flex mt-8 px-6 py-3 border border-myntra text-myntra text-sm font-bold uppercase tracking-wide"
        >
          Add items from wishlist
        </Link>
      </div>
    );
  }

  function onApply() {
    const formatted = sanitizeCoupon(code);
    const formatErr = couponFormatError(formatted);
    if (formatErr) {
      setCouponError(formatErr);
      return;
    }
    const ok = applyCoupon(formatted);
    if (!ok) {
      setCouponError('Invalid coupon or order value too low');
      return;
    }
    setCouponError('');
    setCode('');
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
    <div className="max-w-[1100px] mx-auto px-4 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-4">
        <div className="bg-white p-4 border border-line">
          <p className="text-sm font-bold mb-3">Check delivery time &amp; services</p>
          <div className="flex max-w-sm h-11 items-stretch border border-line overflow-hidden">
            <input
              value={pincode}
              onChange={(e) => {
                setPincode(onlyDigits(e.target.value, 6));
                setPinMsg('');
                setPinOk(false);
              }}
              placeholder="Enter PIN CODE"
              inputMode="numeric"
              maxLength={6}
              className="min-w-0 flex-1 px-3 text-sm outline-none uppercase"
            />
            <button
              type="button"
              onClick={checkPin}
              className="shrink-0 px-4 border-l border-line text-sm font-bold text-myntra"
            >
              CHECK
            </button>
          </div>
          {pinMsg && (
            <p className={`text-[13px] font-semibold mt-2 ${pinOk ? 'text-forest' : 'text-myntra'}`}>
              {pinMsg}
            </p>
          )}
        </div>

        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.size}`}
            className="bg-white border border-line p-4 flex gap-4 relative"
          >
            <Link
              href={`/products/item/${item.product.slug}`}
              className="relative w-28 aspect-[3/4] shrink-0 bg-mist"
            >
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px]">{item.product.brand}</p>
              <p className="text-[13px] text-ink-soft truncate">{item.product.name}</p>
              <p className="text-[12px] text-muted mt-1">Sold by {item.product.seller}</p>
              <div className="flex items-center gap-3 mt-3">
                <label className="text-[12px] font-bold bg-mist px-2 py-1 rounded">
                  Size: {item.size}
                </label>
                <label className="text-[12px] font-bold bg-mist px-2 py-1 rounded flex items-center gap-2">
                  Qty:
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.product.id, item.size, Number(e.target.value))
                    }
                    className="bg-transparent outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex items-center gap-2 mt-3 text-[14px]">
                <span className="font-bold">{formatInr(item.product.price)}</span>
                <span className="text-muted line-through text-[12px]">
                  {formatInr(item.product.mrp)}
                </span>
              </div>
              <p className="text-[12px] text-ink-soft mt-2">14 days return available</p>
              <div className="flex gap-4 mt-3 text-[13px] font-bold">
                <button
                  onClick={() => {
                    addWish(item.product);
                    removeItem(item.product.id, item.size);
                  }}
                  className="hover:text-myntra"
                >
                  MOVE TO WISHLIST
                </button>
                <button
                  onClick={() => removeItem(item.product.id, item.size)}
                  className="hover:text-myntra"
                >
                  REMOVE
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.product.id, item.size)}
              className="absolute top-3 right-3 text-muted hover:text-ink"
              aria-label="Remove"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit lg:sticky lg:top-6 space-y-4">
        <div className="bg-white border border-line p-4">
          <p className="text-[12px] font-bold uppercase text-ink-soft mb-3 flex items-center gap-2">
            <Tag size={14} /> Coupons
          </p>
          {coupon ? (
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-forest">{coupon} applied</span>
              <button onClick={clearCoupon} className="text-myntra font-bold text-xs">
                REMOVE
              </button>
            </div>
          ) : (
            <div>
              <div className="flex border border-line rounded overflow-hidden">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(sanitizeCoupon(e.target.value));
                    setCouponError('');
                  }}
                  placeholder="Apply Coupons"
                  maxLength={16}
                  className="flex-1 px-3 py-2 text-sm outline-none uppercase"
                />
                <button onClick={onApply} className="px-4 text-sm font-bold text-myntra">
                  APPLY
                </button>
              </div>
              {couponError && <p className="text-xs text-myntra mt-1">{couponError}</p>}
              <p className="text-[11px] text-muted mt-2">
                Try {Object.keys(COUPON_LIST).join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-line p-4">
          <PriceDetails mrp={mrp} price={price} coupon={couponOff} />
          {!user && (
            <p className="mt-3 text-[12px] text-ink-soft bg-mist p-3 rounded">
              Login required before placing an order.{' '}
              <Link href="/login?next=/checkout" className="font-bold text-myntra">
                Login now
              </Link>
            </p>
          )}
          <button
            onClick={() =>
              router.push(user ? '/checkout' : '/login?next=/checkout')
            }
            className="w-full mt-5 h-12 bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase tracking-wide"
          >
            {user ? 'Place Order' : 'Login to Place Order'}
          </button>
        </div>
      </aside>
    </div>
  );
}
