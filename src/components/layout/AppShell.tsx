'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CheckoutHeader from './CheckoutHeader';
import { useHydrated } from '@/store/hydrate';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setHydrated = useHydrated((s) => s.setHydrated);

  useEffect(() => {
    const finish = () => {
      if (
        useCartStore.persist.hasHydrated() &&
        useWishlistStore.persist.hasHydrated() &&
        useOrderStore.persist.hasHydrated() &&
        useAuthStore.persist.hasHydrated()
      ) {
        setHydrated();
        void useAuthStore.getState().hydrate();
      }
    };
    finish();
    const unsubCart = useCartStore.persist.onFinishHydration(finish);
    const unsubWish = useWishlistStore.persist.onFinishHydration(finish);
    const unsubOrder = useOrderStore.persist.onFinishHydration(finish);
    const unsubAuth = useAuthStore.persist.onFinishHydration(finish);
    return () => {
      unsubCart();
      unsubWish();
      unsubOrder();
      unsubAuth();
    };
  }, [setHydrated]);

  const isAuth = pathname === '/login' || pathname === '/signup';
  if (isAuth) {
    return <main className="min-h-screen bg-mist">{children}</main>;
  }

  const isCheckout =
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname === '/payment' ||
    pathname.startsWith('/payment/success');

  if (isCheckout) {
    return (
      <>
        <CheckoutHeader />
        <main className="min-h-[calc(100vh-80px)] bg-mist">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
