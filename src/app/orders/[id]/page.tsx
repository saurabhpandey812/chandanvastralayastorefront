'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useOrderStore } from '@/store/orderStore';
import { useHydrated } from '@/store/hydrate';
import { formatInr } from '@/lib/format';

const steps = [
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'shipped', label: 'Shipped', icon: Package },
  { id: 'out-for-delivery', label: 'Out for delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <OrderDetailContent />
    </RequireAuth>
  );
}

function OrderDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const lastOrderId = useOrderStore((s) => s.lastOrderId);
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const hydrated = useHydrated((s) => s.hydrated);

  if (!hydrated) return <div className="p-10 text-muted">Loading order...</div>;

  if (!order) {
    return (
      <div className="max-w-content mx-auto px-6 py-24 text-center bg-white">
        <p className="font-bold">Order not found</p>
        <Link href={lastOrderId ? `/orders/${lastOrderId}` : '/orders'} className="text-myntra text-sm font-bold mt-3 inline-block">
          VIEW ALL ORDERS
        </Link>
      </div>
    );
  }

  const current = Math.max(
    0,
    steps.findIndex((s) => s.id === order.status)
  );

  return (
    <div className="bg-mist min-h-screen">
      <div className="max-w-content mx-auto px-4 py-8 space-y-4">
        <div className="bg-white border border-line p-6 text-center">
          <CheckCircle2 className="mx-auto text-forest" size={40} />
          <h1 className="text-xl font-extrabold mt-3">Order placed successfully</h1>
          <p className="text-sm text-muted mt-1">
            Order ID <span className="font-bold text-ink">{order.id}</span>
          </p>
        </div>

        <div className="bg-white border border-line p-6">
          <p className="text-[12px] font-bold uppercase text-ink-soft mb-6">Status</p>
          <div className="flex justify-between relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-line" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-forest"
              style={{ width: `${(current / (steps.length - 1)) * 80}%` }}
            />
            {steps.map((step, i) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center w-24">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    i <= current ? 'bg-forest text-white' : 'bg-line text-muted'
                  }`}
                >
                  <step.icon size={16} />
                </div>
                <p className="text-[11px] font-bold mt-2 text-center">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-line divide-y divide-line">
          {order.items.map((item) => (
            <Link
              key={`${item.product.id}-${item.size}`}
              href={`/products/item/${item.product.slug}`}
              className="flex gap-4 p-4"
            >
              <div className="relative w-20 aspect-[3/4] bg-mist shrink-0">
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm">{item.product.brand}</p>
                <p className="text-[13px] text-ink-soft">{item.product.name}</p>
                <p className="text-[12px] text-muted mt-1">
                  Size: {item.size} · Qty: {item.quantity}
                </p>
                <p className="text-sm font-bold mt-1">{formatInr(item.product.price)}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-line p-4 text-sm">
            <p className="text-[12px] font-bold uppercase text-ink-soft mb-2">Delivery Address</p>
            <p className="font-bold">{order.address.name}</p>
            <p className="text-ink-soft mt-1">
              {order.address.address}, {order.address.locality}, {order.address.city},{' '}
              {order.address.state} - {order.address.pincode}
            </p>
            <p className="mt-1">Mobile: {order.address.mobile}</p>
          </div>
          <div className="bg-white border border-line p-4 text-sm space-y-2">
            <p className="text-[12px] font-bold uppercase text-ink-soft mb-2">Payment</p>
            <div className="flex justify-between">
              <span>Method</span>
              <span className="font-bold">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Item total</span>
              <span>{formatInr(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-forest">
                <span>Coupon {order.couponCode}</span>
                <span>- {formatInr(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-line">
              <span>Total</span>
              <span>{formatInr(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/products/all"
            className="flex-1 text-center py-3 bg-myntra text-white text-sm font-bold uppercase"
          >
            Continue shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 text-center py-3 border border-ink text-sm font-bold uppercase"
          >
            All orders
          </Link>
        </div>
      </div>
    </div>
  );
}
