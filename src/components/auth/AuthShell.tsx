'use client';

import { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';

export default function AuthShell({
  children,
  kicker,
  title,
  subtitle,
}: {
  children: ReactNode;
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-[#fcfcfd] grid lg:grid-cols-2">
      <div className="relative hidden lg:block overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b0a16]/85 via-[#ff3f6c]/55 to-[#2b0a16]/70" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
          <BrandLogo href="/" variant="light" size="lg" />
          <div>
            <p className="text-[12px] font-bold tracking-[4px] uppercase text-gold">{kicker}</p>
            <h1 className="mt-3 text-4xl xl:text-5xl font-black leading-tight">{title}</h1>
            <p className="mt-4 text-white/85 max-w-md text-lg">{subtitle}</p>
            <ul className="mt-8 space-y-3 text-sm font-semibold">
              <li className="flex items-center gap-2">✦ Track orders &amp; returns</li>
              <li className="flex items-center gap-2">✦ Wishlist across devices</li>
              <li className="flex items-center gap-2">✦ Faster checkout &amp; saved addresses</li>
            </ul>
          </div>
          <p className="text-[12px] text-white/70 flex items-center gap-2">
            <ShieldCheck size={16} /> 100% original products · Secure checkout
          </p>
        </div>
      </div>

      <div className="flex flex-col min-h-screen">
        <header className="lg:hidden h-16 px-5 flex items-center border-b border-line bg-white">
          <BrandLogo href="/" size="sm" />
        </header>
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
