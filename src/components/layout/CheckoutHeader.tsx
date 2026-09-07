'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import BrandLogo from '@/components/brand/BrandLogo';

const steps = [
  { id: 'bag', label: 'Bag', href: '/cart' },
  { id: 'address', label: 'Address', href: '/checkout' },
  { id: 'payment', label: 'Payment', href: '/payment' },
];

export default function CheckoutHeader() {
  const pathname = usePathname();
  const isSuccess = pathname.startsWith('/payment/success');
  const current =
    isSuccess || pathname.startsWith('/payment')
      ? 'payment'
      : pathname.startsWith('/checkout')
        ? 'address'
        : 'bag';

  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <header className="bg-white border-b border-line">
      <div className="max-w-store mx-auto px-6 h-[80px] flex items-center justify-between">
        <BrandLogo href="/" />

        <nav className="hidden sm:flex items-center gap-3 text-[13px] font-bold uppercase tracking-[3px]">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-3">
              {i > 0 && (
                <span className="w-16 h-px border-t border-dashed border-muted" />
              )}
              <Link
                href={step.href}
                className={clsx(
                  i <= currentIndex || isSuccess ? 'text-forest' : 'text-muted',
                  current === step.id && !isSuccess && 'border-b-2 border-forest pb-0.5',
                  isSuccess && 'border-b-2 border-forest pb-0.5'
                )}
              >
                {step.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-ink-soft text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={22} className="text-forest" />
          100% Secure
        </div>
      </div>
    </header>
  );
}
