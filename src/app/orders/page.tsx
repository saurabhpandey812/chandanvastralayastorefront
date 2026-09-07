'use client';

import Image from 'next/image';
import Link from 'next/link';
import RequireAuth from '@/components/auth/RequireAuth';
import { useOrderStore } from '@/store/orderStore';
import { useHydrated } from '@/store/hydrate';
import { formatInr } from '@/lib/format';

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}

function OrdersContent() {
  const orders = useOrderStore((s) => s.orders);
  const hydrated = useHydrated((s) => s.hydrated);

  if (!hydrated) return <div className="p-10 text-muted">Loading orders...</div>;

  return (
    <div className="bg-mist min-h-screen">
      <div className="max-w-content mx-auto px-4 py-8">
        <h1 className="text-[18px] font-bold mb-4">All Orders</h1>
        {orders.length === 0 ? (
          <div className="bg-white border border-line p-12 text-center">
            <p className="font-bold">You haven&apos;t placed any orders yet</p>
            <Link href="/products/all" className="inline-block mt-4 text-myntra font-bold text-sm">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white border border-line p-4 hover:shadow-card"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-bold uppercase text-forest">{order.status}</p>
                    <p className="text-sm font-bold mt-1">Order #{order.id}</p>
                    <p className="text-[12px] text-muted">
                      {new Date(order.createdAt).toLocaleString('en-IN')} · {order.items.length} item
                      {order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="font-bold">{formatInr(order.total)}</p>
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {order.items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="relative h-16 w-12 shrink-0 bg-mist"
                    >
                      <Image src={item.product.images[0]} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
