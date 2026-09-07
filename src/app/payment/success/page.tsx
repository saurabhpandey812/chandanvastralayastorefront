'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Copy, Package, Truck } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useHydrated } from '@/store/hydrate';
import { formatInr } from '@/lib/format';

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated((s) => s.hydrated);
  const lastOrderId = useOrderStore((s) => s.lastOrderId);
  const orders = useOrderStore((s) => s.orders);
  const [copied, setCopied] = useState(false);

  const orderId = params.get('orderId') || lastOrderId;
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (hydrated && !order) router.replace('/orders');
  }, [hydrated, order, router]);

  if (!hydrated) {
    return <div className="p-10 text-center text-muted">Confirming your payment...</div>;
  }

  if (!order) {
    return <div className="p-10 text-center text-muted">Loading confirmation...</div>;
  }

  const isCod = order.paymentMethod.toLowerCase().includes('cash');
  const eta = new Date(new Date(order.createdAt).getTime() + 5 * 86400000).toLocaleDateString(
    'en-IN',
    { weekday: 'short', day: 'numeric', month: 'short' }
  );

  function copyId() {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-10">
      <div className="bg-white border border-line rounded-sm overflow-hidden">
        <div className="bg-[#e5f8f2] px-6 py-10 text-center">
          <div className="relative mx-auto h-20 w-20">
            <span className="success-ring absolute inset-0 rounded-full bg-forest/30" />
            <span className="success-pop relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-forest text-white shadow-card">
              <Check size={40} strokeWidth={3} />
            </span>
          </div>
          <p className="mt-5 text-[13px] font-bold uppercase tracking-[3px] text-forest">
            {isCod ? 'Order confirmed' : 'Payment successful'}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">
            Order placed successfully
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isCod
              ? `Pay ${formatInr(order.total)} in cash or UPI when your order arrives.`
              : `We received ${formatInr(order.total)} via ${order.paymentMethod}.`}
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-dashed border-forest/40 bg-[#f4fbf8] p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Order ID</p>
              <p className="text-lg font-extrabold tracking-wide">{order.id}</p>
            </div>
            <button
              onClick={copyId}
              className="inline-flex items-center gap-2 text-sm font-bold text-myntra"
            >
              <Copy size={14} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="border border-line p-4 flex gap-3">
              <Truck className="text-forest shrink-0" size={22} />
              <div>
                <p className="text-[11px] font-bold uppercase text-muted">Estimated delivery</p>
                <p className="font-bold">{eta}</p>
              </div>
            </div>
            <div className="border border-line p-4 flex gap-3">
              <Package className="text-forest shrink-0" size={22} />
              <div>
                <p className="text-[11px] font-bold uppercase text-muted">Items</p>
                <p className="font-bold">
                  {order.items.reduce((n, i) => n + i.quantity, 0)} item
                  {order.items.reduce((n, i) => n + i.quantity, 0) > 1 ? 's' : ''} · {formatInr(order.total)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-bold uppercase text-ink-soft mb-3">Items in this order</p>
            <div className="divide-y divide-line border border-line">
              {order.items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3 p-3">
                  <div className="relative h-16 w-12 shrink-0 bg-mist">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{item.product.brand}</p>
                    <p className="text-[12px] text-ink-soft truncate">{item.product.name}</p>
                    <p className="text-[12px] text-muted">
                      Size {item.size} · Qty {item.quantity} · {formatInr(item.product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="border border-line p-4">
              <p className="text-[11px] font-bold uppercase text-muted mb-1">Deliver to</p>
              <p className="font-bold">{order.address.name}</p>
              <p className="text-ink-soft mt-1">
                {order.address.address}, {order.address.city}, {order.address.state} -{' '}
                {order.address.pincode}
              </p>
            </div>
            <div className="border border-line p-4 space-y-1">
              <p className="text-[11px] font-bold uppercase text-muted mb-1">Payment</p>
              <p className="font-bold">{isCod ? 'Cash on Delivery' : 'Paid'}</p>
              <p className="text-ink-soft">{order.paymentMethod}</p>
              <p className="font-extrabold text-forest pt-1">{formatInr(order.total)}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <Link
              href={`/orders/${order.id}`}
              className="h-12 flex items-center justify-center bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase"
            >
              View order details
            </Link>
            <Link
              href="/products/all"
              className="h-12 flex items-center justify-center border border-ink text-sm font-bold uppercase"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted">Confirming your payment...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
