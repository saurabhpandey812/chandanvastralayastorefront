'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Heart, LogOut, Package } from 'lucide-react';
import ProfileGuest from '@/components/profile/ProfileGuest';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';

const rows = [
  { href: '/orders', label: 'Orders', hint: 'Check order status, returns & invoices', icon: Package },
  { href: '/wishlist', label: 'Wishlist', hint: 'Your saved looks', icon: Heart },
];

export default function ProfilePage() {
  const router = useRouter();
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!hydrated) {
    return <div className="p-10 text-center text-muted">Loading profile...</div>;
  }

  if (!user) return <ProfileGuest next="/profile" />;

  const details = [
    { label: 'Full name', value: user.name },
    { label: 'Gender', value: user.gender || '—' },
    { label: 'Email', value: user.email },
    { label: 'Mobile', value: `+91 ${user.mobile}` },
  ];

  return (
    <div className="bg-mist min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white border border-line p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-myntra text-white flex items-center justify-center font-black text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-lg truncate">{user.name}</p>
            <p className="text-sm text-muted truncate">{user.email}</p>
            <p className="text-[12px] text-ink-soft mt-0.5">+91 {user.mobile}</p>
          </div>
        </div>

        <div className="bg-white border border-line mt-4 p-5">
          <h2 className="text-[16px] font-black">Profile details</h2>
          <div className="mt-4 divide-y divide-line">
            {details.map((row) => (
              <div key={row.label} className="py-3 flex items-start justify-between gap-4">
                <p className="text-[12px] font-bold uppercase tracking-wide text-muted">{row.label}</p>
                <p className="text-sm font-semibold text-ink text-right">{row.value}</p>
              </div>
            ))}
          </div>
          <Link
            href="/profile/edit"
            className="mt-5 inline-flex w-full h-12 items-center justify-center bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase"
          >
            Edit profile
          </Link>
        </div>

        <div className="bg-white border border-line mt-4 divide-y divide-line">
          {rows.map((row) => (
            <Link key={row.href} href={row.href} className="flex items-center gap-3 p-4 hover:bg-mist">
              <row.icon size={18} className="text-ink-soft" />
              <div className="flex-1">
                <p className="text-sm font-bold">{row.label}</p>
                <p className="text-[12px] text-muted">{row.hint}</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </Link>
          ))}
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-mist text-left"
          >
            <LogOut size={18} className="text-myntra" />
            <div className="flex-1">
              <p className="text-sm font-bold text-myntra">Logout</p>
              <p className="text-[12px] text-muted">Sign out of this device</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
