'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

export default function ProfileGuest({ next = '/profile' }: { next?: string }) {
  return (
    <div className="bg-mist min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white border border-line p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-mist grid place-items-center">
            <User size={28} className="text-ink-soft" />
          </div>
          <h1 className="mt-4 text-xl font-black">Login to your Chandan Vastralaya account</h1>
          <p className="mt-2 text-sm text-muted">
            You need to be signed in to view your profile, place an order and track shipments.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="mt-6 inline-flex h-12 w-full items-center justify-center bg-myntra text-white text-sm font-bold uppercase"
          >
            Login
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="mt-3 inline-flex h-12 w-full items-center justify-center border border-myntra text-myntra text-sm font-bold uppercase"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
