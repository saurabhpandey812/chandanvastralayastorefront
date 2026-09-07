import type { Metadata } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const assistant = Assistant({
  subsets: ['latin'],
  variable: '--font-assistant',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Chandan Vastralaya — Online Fashion Store',
  description:
    'Shop clothing for men, women and kids at Chandan Vastralaya. Wishlist, bag, checkout and orders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${assistant.variable} font-sans bg-mist text-ink antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
