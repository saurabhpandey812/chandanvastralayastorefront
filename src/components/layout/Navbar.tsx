'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Heart,
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';
import ProfileMenu from './ProfileMenu';
import { sanitizeSearch, searchQueryError } from '@/lib/validation';

type MenuGroup = { title: string; links: [string, string][] };
type MenuColumn = { groups: MenuGroup[] };

const navItems: {
  label: string;
  href: string;
  accent: string;
  badge?: string;
  columns: MenuColumn[];
}[] = [
  {
    label: 'Men',
    href: '/products/men',
    accent: '#ee5f73',
    columns: [
      {
        groups: [
          {
            title: 'Topwear',
            links: [
              ['T-Shirts', '/search?q=t-shirt'],
              ['Casual Shirts', '/search?q=shirt'],
              ['Formal Shirts', '/search?q=oxford'],
              ['Sweaters', '/search?q=sweater'],
              ['Jackets', '/search?q=jacket'],
            ],
          },
          {
            title: 'Indian & Festive Wear',
            links: [
              ['Kurtas', '/search?q=kurta'],
              ['Sherwanis', '/products/ethnic'],
              ['Nehru Jackets', '/products/ethnic'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Bottomwear',
            links: [
              ['Jeans', '/search?q=jeans'],
              ['Casual Trousers', '/search?q=chino'],
              ['Track Pants', '/search?q=joggers'],
              ['Shorts', '/products/men'],
            ],
          },
          {
            title: 'Innerwear & Sleepwear',
            links: [
              ['Briefs & Trunks', '/products/men'],
              ['Boxers', '/products/men'],
            ],
          },
          {
            title: 'Plus Size',
            links: [['Explore Plus Size', '/products/men']],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Footwear',
            links: [
              ['Casual Shoes', '/search?q=sneaker'],
              ['Sports Shoes', '/search?q=puma'],
              ['Sneakers', '/search?q=sneaker'],
            ],
          },
          {
            title: 'Personal Care & Grooming',
            links: [['Grooming', '/products/men']],
          },
          {
            title: 'Sunglasses & Watches',
            links: [
              ['Sunglasses', '/products/men'],
              ['Watches', '/products/men'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Sports & Active Wear',
            links: [
              ['Sports Shoes', '/search?q=nike'],
              ['Sports Sandals', '/products/men'],
              ['Active T-Shirts', '/search?q=t-shirt'],
              ['Track Pants & Joggers', '/search?q=joggers'],
            ],
          },
          {
            title: 'Gadgets',
            links: [
              ['Smart Wearables', '/products/men'],
              ['Headphones', '/products/men'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Fashion Accessories',
            links: [
              ['Wallets', '/products/men'],
              ['Belts', '/products/men'],
              ['Perfumes & Body Mists', '/products/men'],
              ['Caps & Hats', '/products/men'],
            ],
          },
          {
            title: 'Bags & Backpacks',
            links: [['Bags & Backpacks', '/products/men']],
          },
        ],
      },
    ],
  },
  {
    label: 'Women',
    href: '/products/women',
    accent: '#fb56c1',
    columns: [
      {
        groups: [
          {
            title: 'Indian & Fusion Wear',
            links: [
              ['Kurtas & Suits', '/search?q=kurta'],
              ['Kurtis & Tunics', '/products/ethnic'],
              ['Sarees', '/search?q=saree'],
              ['Ethnic Dresses', '/products/ethnic'],
            ],
          },
          {
            title: 'Belts, Scarves & More',
            links: [['Accessories', '/products/women']],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Western Wear',
            links: [
              ['Dresses', '/search?q=dress'],
              ['Tops', '/search?q=top'],
              ['Tshirts', '/search?q=t-shirt'],
              ['Jeans', '/search?q=jean'],
              ['Skirts', '/search?q=skirt'],
              ['Jackets & Coats', '/search?q=jacket'],
            ],
          },
          {
            title: 'Plus Size',
            links: [['Explore Plus Size', '/products/women']],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Maternity',
            links: [['Maternity Wear', '/products/women']],
          },
          {
            title: 'Sunglasses & Frames',
            links: [['Sunglasses', '/products/women']],
          },
          {
            title: 'Footwear',
            links: [
              ['Flats', '/products/women'],
              ['Casual Shoes', '/products/women'],
              ['Heels', '/products/women'],
              ['Boots', '/products/women'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Sports & Active Wear',
            links: [
              ['Clothing', '/products/women'],
              ['Footwear', '/products/women'],
              ['Sports Accessories', '/products/women'],
              ['Sports Equipment', '/products/women'],
            ],
          },
          {
            title: 'Lingerie & Sleepwear',
            links: [
              ['Bra', '/products/women'],
              ['Briefs', '/products/women'],
              ['Sleepwear', '/products/women'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Beauty & Personal Care',
            links: [
              ['Makeup', '/products/women'],
              ['Skincare', '/products/women'],
              ['Premium Beauty', '/products/women'],
              ['Lipsticks', '/products/women'],
            ],
          },
          {
            title: 'Gadgets',
            links: [
              ['Smart Wearables', '/products/women'],
              ['Fitness Gadgets', '/products/women'],
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Kids',
    href: '/products/kids',
    accent: '#f26a10',
    columns: [
      {
        groups: [
          {
            title: 'Boys Clothing',
            links: [
              ['T-Shirts', '/search?q=kids'],
              ['Shirts', '/products/kids'],
              ['Jeans', '/search?q=boys'],
              ['Hoodies', '/search?q=hoodie'],
            ],
          },
          {
            title: 'Boys Footwear',
            links: [
              ['Casual Shoes', '/products/kids'],
              ['Sports Shoes', '/products/kids'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Girls Clothing',
            links: [
              ['Dresses', '/search?q=pinafore'],
              ['Tops', '/products/kids'],
              ['Ethnic Wear', '/products/ethnic'],
            ],
          },
          {
            title: 'Girls Footwear',
            links: [
              ['Casual Shoes', '/products/kids'],
              ['Flats', '/products/kids'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Infants',
            links: [
              ['Rompers', '/products/kids'],
              ['Sets', '/products/kids'],
              ['Dresses', '/products/kids'],
            ],
          },
          {
            title: 'Infant Care',
            links: [['Baby Care', '/products/kids']],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Kids Accessories',
            links: [
              ['Bags & Backpacks', '/products/kids'],
              ['Watches', '/products/kids'],
              ['Sunglasses', '/products/kids'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Brands',
            links: [
              ['HERE&NOW', '/search?q=HERE'],
              ['Max', '/search?q=Max'],
              ['Pepe Jeans', '/search?q=Pepe'],
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Ethnic',
    href: '/products/ethnic',
    accent: '#0db7af',
    columns: [
      {
        groups: [
          {
            title: 'Women Ethnic',
            links: [
              ['Kurtas', '/search?q=kurta'],
              ['Kurta Sets', '/search?q=anarkali'],
              ['Sarees', '/search?q=saree'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Men Ethnic',
            links: [
              ['Kurtas', '/search?q=kurta'],
              ['Sherwanis', '/products/ethnic'],
              ['Nehru Jackets', '/products/ethnic'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Kids Ethnic',
            links: [
              ['Boys', '/products/kids'],
              ['Girls', '/products/kids'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Festive Edit',
            links: [
              ['Wedding', '/products/ethnic'],
              ['Festive', '/products/ethnic'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Brands',
            links: [
              ['Libas', '/search?q=Libas'],
              ['Biba', '/search?q=Biba'],
              ['Manyavar', '/search?q=Manyavar'],
              ['Kalini', '/search?q=Kalini'],
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Studio',
    href: '/products/studio',
    accent: '#ff3f6c',
    badge: 'NEW',
    columns: [
      {
        groups: [
          {
            title: 'Looks',
            links: [
              ['Autumn Edit', '/products/all'],
              ['Festive Edit', '/products/ethnic'],
              ['Street Edit', '/products/men'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Collections',
            links: [
              ['New In', '/products/all'],
              ['Trending', '/products/women'],
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: 'Shop by Occasion',
            links: [
              ['Work', '/products/women'],
              ['Weekend', '/products/men'],
              ['Wedding', '/products/ethnic'],
            ],
          },
        ],
      },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const bagCount = useCartStore((s) => s.totalItems());
  const wishCount = useWishlistStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useHydrated((s) => s.hydrated);
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const shownBag = hydrated ? bagCount : 0;
  const shownWish = hydrated ? wishCount : 0;
  const openItem = navItems.find((n) => n.label === openMenu);

  const active = useMemo(
    () => navItems.find((n) => pathname.startsWith(n.href))?.label,
    [pathname]
  );

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    const err = searchQueryError(q);
    if (err) {
      setSearchError(err);
      return;
    }
    setSearchError('');
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/products/all');
    setMobileOpen(false);
  }

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-40 bg-white shadow-nav relative overflow-visible"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="max-w-store mx-auto px-4 lg:px-8">
        <div className="flex items-center h-[80px] gap-4">
          <button
            className="lg:hidden text-ink"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-myntra text-white font-black text-xl italic">
              A
            </span>
            <span className="hidden sm:block font-extrabold text-[22px] tracking-tight text-ink">
              Aaraish
            </span>
          </Link>

          <nav className="hidden lg:flex items-stretch h-full ml-6">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative h-full"
                onMouseEnter={() => setOpenMenu(item.label)}
              >
                <Link
                  href={item.href}
                  className="relative flex h-full items-center px-4 text-[14px] font-bold uppercase tracking-wide text-ink"
                >
                  {item.label}
                  {item.badge && (
                    <span
                      className="absolute top-4 right-0 text-[9px] font-bold"
                      style={{ color: item.accent }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {(openMenu === item.label || (!openMenu && active === item.label)) && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[4px]"
                      style={{ background: item.accent }}
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 min-w-0 max-w-xl ml-auto">
            <div className="relative w-full min-w-0">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(sanitizeSearch(e.target.value));
                  setSearchError('');
                }}
                maxLength={80}
                placeholder="Search for products, brands and more"
                className="w-full min-w-0 h-10 rounded-md bg-mist pl-11 pr-4 text-sm text-ink placeholder:text-muted outline-none focus:bg-white focus:ring-1 focus:ring-line"
              />
              {searchError && (
                <p className="absolute left-0 top-full mt-1 z-50 bg-white px-1 text-[11px] font-semibold text-myntra">
                  {searchError}
                </p>
              )}
            </div>
          </form>

          <div className="flex items-center gap-5 ml-2 lg:ml-6 shrink-0">
            <ProfileMenu />
            <Link href="/wishlist" className="relative flex flex-col items-center text-ink hover:text-myntra">
              <Heart size={18} />
              <span className="hidden sm:block text-[11px] font-bold mt-0.5">Wishlist</span>
              {shownWish > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-myntra text-[10px] text-white flex items-center justify-center">
                  {shownWish}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative flex flex-col items-center text-ink hover:text-myntra">
              <ShoppingBag size={18} />
              <span className="hidden sm:block text-[11px] font-bold mt-0.5">Bag</span>
              {shownBag > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-myntra text-[10px] text-white flex items-center justify-center">
                  {shownBag}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {openItem && (
        <>
          <div className="hidden lg:block pointer-events-none fixed inset-x-0 top-[80px] bottom-0 z-30 bg-black/20" />
          <div className="hidden lg:block absolute left-1/2 top-full z-40 w-[min(1110px,calc(100vw-96px))] -translate-x-1/2 overflow-hidden bg-white shadow-[0_12px_28px_rgba(40,44,63,0.18)]">
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${openItem.columns.length}, minmax(0, 1fr))` }}
            >
              {openItem.columns.map((col, i) => (
                <div
                  key={i}
                  className="px-6 py-7 min-h-[320px]"
                  style={{
                    background: i % 2 === 1 ? `${openItem.accent}12` : '#ffffff',
                  }}
                >
                  {col.groups.map((group, gi) => (
                    <div key={group.title} className={gi > 0 ? 'mt-6 pt-5 border-t border-black/5' : ''}>
                      <p
                        className="text-[14px] font-bold mb-3"
                        style={{ color: openItem.accent }}
                      >
                        {group.title}
                      </p>
                      <ul className="space-y-2">
                        {group.links.map(([label, href]) => (
                          <li key={label}>
                            <Link
                              href={href}
                              className="text-[14px] text-[#3e4152] hover:font-bold hover:text-ink"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-white px-4 py-4 space-y-4">
          <form onSubmit={onSearch} className="md:hidden">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(sanitizeSearch(e.target.value));
                  setSearchError('');
                }}
                maxLength={80}
                placeholder="Search for products, brands and more"
                className="w-full h-10 rounded-md bg-mist pl-10 pr-3 text-sm outline-none"
              />
              {searchError && (
                <p className="text-[11px] font-semibold text-myntra mt-1">{searchError}</p>
              )}
            </div>
          </form>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between py-2 text-sm font-bold uppercase text-ink"
            >
              <span className="flex items-center gap-2">
                {item.label}
                <span className="h-2 w-2 rounded-full" style={{ background: item.accent }} />
              </span>
              <ChevronDown size={14} className="text-muted" />
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="block py-2 text-sm font-bold text-ink">
                Hi, {user.name.split(' ')[0]}
              </Link>
              <Link href="/orders" className="block py-2 text-sm font-bold text-ink">
                Orders
              </Link>
              <button onClick={logout} className="block py-2 text-sm font-bold text-myntra">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm font-bold text-myntra">
                Login
              </Link>
              <Link href="/signup" className="block py-2 text-sm font-bold text-ink">
                Signup
              </Link>
              <Link href="/orders" className="block py-2 text-sm font-bold text-ink">
                Orders
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
