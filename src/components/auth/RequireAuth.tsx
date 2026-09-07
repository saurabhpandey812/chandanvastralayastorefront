'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated) {
    return <div className="p-10 text-center text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="font-bold">Please log in to continue</p>
        <p className="text-sm text-muted mt-1">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
