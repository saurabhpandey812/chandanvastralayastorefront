import Image from 'next/image';
import Link from 'next/link';
import HeroBanner from '@/components/home/HeroBanner';
import ProductGrid from '@/components/product/ProductGrid';
import { products } from '@/lib/data/products';

const deals = [
  {
    title: 'Kurtas & Sets',
    off: 'Min 50% Off',
    href: '/products/ethnic',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Casual Shirts',
    off: 'From ₹899',
    href: '/products/men',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b88?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Dresses',
    off: 'Min 40% Off',
    href: '/products/women',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Sneakers',
    off: 'From ₹2499',
    href: '/products/men',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
];

const categories = [
  { label: 'Men', href: '/products/men', seed: 'photo-1441984904996-e0b6ba687e04' },
  { label: 'Women', href: '/products/women', seed: 'photo-1483985988355-763728e1935b' },
  { label: 'Kids', href: '/products/kids', seed: 'photo-1503919545889-aef636e10ad4' },
  { label: 'Ethnic', href: '/products/ethnic', seed: 'photo-1610030469983-98e550d6193c' },
];

const brandsRow = [
  { name: "Levi's", href: '/search?q=Levi' },
  { name: 'Nike', href: '/search?q=Nike' },
  { name: 'Puma', href: '/search?q=Puma' },
  { name: 'Biba', href: '/search?q=Biba' },
  { name: 'H&M', href: '/search?q=H%26M' },
  { name: 'Roadster', href: '/search?q=Roadster' },
  { name: 'ONLY', href: '/search?q=ONLY' },
  { name: 'Adidas', href: '/search?q=Adidas' },
];

export default function HomePage() {
  const trending = products.filter((p) => p.rating >= 4.4).slice(0, 10);
  const fresh = products.filter((p) => p.isNew);

  return (
    <div className="bg-white">
      <HeroBanner />

      <section className="max-w-store mx-auto px-4 py-10">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-ink text-center mb-8">
          Medal Worthy Brands To Bag
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <Link
              key={deal.title}
              href={deal.href}
              className="group relative overflow-hidden rounded-md bg-mist"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-sm font-semibold">{deal.title}</p>
                  <p className="text-lg font-black text-gold">{deal.off}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-mist py-10">
        <div className="max-w-store mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-ink text-center mb-8">
            Categories To Bag
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.label} href={cat.href} className="group text-center">
                <div className="relative mx-auto h-40 w-40 sm:h-52 sm:w-52 rounded-full overflow-hidden border-4 border-white shadow-card">
                  <Image
                    src={`https://images.unsplash.com/${cat.seed}?auto=format&fit=crop&w=500&q=80`}
                    alt={cat.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-wider">{cat.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-store mx-auto px-4 py-10">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-ink text-center mb-6">
          Top Brands
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {brandsRow.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              className="px-5 py-2.5 bg-mist hover:bg-myntra hover:text-white text-sm font-bold rounded-full border border-line transition-colors"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-store mx-auto px-4 pb-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl font-extrabold uppercase tracking-wide">Trending Now</h2>
          <Link href="/products/all" className="text-sm font-bold text-myntra">
            VIEW ALL
          </Link>
        </div>
        <ProductGrid products={trending} />
      </section>

      <section className="max-w-store mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl font-extrabold uppercase tracking-wide">New In This Week</h2>
          <Link href="/products/all" className="text-sm font-bold text-myntra">
            VIEW ALL
          </Link>
        </div>
        <ProductGrid products={fresh} />
      </section>
    </div>
  );
}
