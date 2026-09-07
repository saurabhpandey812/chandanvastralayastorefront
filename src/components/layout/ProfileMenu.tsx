'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, LogOut, Package, Pencil, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';

export default function ProfileMenu() {
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const first = user?.name.split(' ')[0] ?? 'Profile';

  return (
    <div
      className="relative hidden sm:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={user ? '/profile' : '/login'}
        className="flex flex-col items-center text-ink hover:text-myntra px-1"
      >
        <User size={18} />
        <span className="text-[11px] font-bold mt-0.5">{hydrated && user ? first : 'Profile'}</span>
      </Link>

      {open && (
        <div className="absolute right-0 top-full w-[280px] bg-white shadow-[0_8px_24px_rgba(40,44,63,0.16)] border border-line z-50">
          {user ? (
            <div className="p-4 border-b border-line">
              <p className="text-sm font-bold">Hello {first}</p>
              <p className="text-[12px] text-muted truncate">{user.email}</p>
            </div>
          ) : (
            <div className="p-4 border-b border-line">
              <p className="text-sm font-bold">Welcome</p>
              <p className="text-[12px] text-muted mt-0.5">To place an order, please login</p>
              <div className="flex gap-2 mt-3">
                <Link
                  href="/login"
                  className="flex-1 h-9 grid place-items-center bg-myntra text-white text-[12px] font-bold uppercase"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 h-9 grid place-items-center border border-myntra text-myntra text-[12px] font-bold uppercase"
                >
                  Signup
                </Link>
              </div>
            </div>
          )}
          <div className="py-2 text-[13px]">
            <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-mist">
              <Package size={14} /> Orders
            </Link>
            <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-mist">
              <Heart size={14} /> Wishlist
            </Link>
            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-mist">
              <User size={14} /> Profile
            </Link>
            {user && (
              <Link href="/profile/edit" className="flex items-center gap-2 px-4 py-2 hover:bg-mist">
                <Pencil size={14} /> Edit profile
              </Link>
            )}
            {user && (
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-mist text-left text-myntra font-semibold"
              >
                <LogOut size={14} /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
