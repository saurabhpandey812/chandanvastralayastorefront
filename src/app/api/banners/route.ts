import { jsonOk } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

const banners = [
  {
    id: 'b1',
    href: '/products/women',
    kicker: 'END OF SEASON SALE',
    title: 'FLAT 50–80% OFF',
    subtitle: 'Western wear, ethnic sets & more',
    active: true,
  },
  {
    id: 'b2',
    href: '/products/men',
    kicker: "MEN'S FESTIVE EDIT",
    title: 'SHIRTS, JACKETS, KURTAS',
    subtitle: 'Starting ₹899',
    active: true,
  },
  {
    id: 'b3',
    href: '/products/ethnic',
    kicker: 'WEDDING SEASON',
    title: 'KURTA SETS & SAREES',
    subtitle: 'Biba · Libas · Kalini · Manyavar',
    active: true,
  },
  {
    id: 'b4',
    href: '/products/kids',
    kicker: 'KIDS WEAR',
    title: 'PLAY-READY DROPS',
    subtitle: 'Tees, jeans, hoodies from ₹399',
    active: true,
  },
];

export async function GET() {
  return jsonOk({ banners: banners.filter((b) => b.active) });
}
