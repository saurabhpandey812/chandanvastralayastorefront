import Link from 'next/link';

const columns = [
  {
    title: 'Online Shopping',
    links: [
      ['Men', '/products/men'],
      ['Women', '/products/women'],
      ['Kids', '/products/kids'],
      ['Ethnic', '/products/ethnic'],
      ['Studio', '/products/studio'],
    ],
  },
  {
    title: 'Customer Policies',
    links: [
      ['Contact Us', '/profile'],
      ['FAQ', '/orders'],
      ['T&C', '/profile'],
      ['Terms Of Use', '/profile'],
      ['Track Orders', '/orders'],
      ['Shipping', '/orders'],
      ['Cancellation', '/orders'],
      ['Returns', '/orders'],
      ['Privacy policy', '/profile'],
    ],
  },
  {
    title: 'Experience Aaraish App',
    links: [
      ['Android App', '/'],
      ['iOS App', '/'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-mist border-t border-line mt-10">
      <div className="max-w-store mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink mb-4">
              {col.title}
            </p>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] text-ink-soft hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-ink mb-4">
            Keep in touch
          </p>
          <p className="text-[13px] text-ink-soft leading-relaxed mb-4">
            New drops, festive edits and bag-worthy deals — once a week, max.
          </p>
          <div className="flex gap-3 text-[12px] font-bold text-ink">
            <span className="px-2 py-1 bg-white border border-line">100% ORIGINAL</span>
            <span className="px-2 py-1 bg-white border border-line">14 DAY RETURNS</span>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="max-w-store mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-ink-soft">
          <p>© {new Date().getFullYear()} www.aaraish.com. All rights reserved.</p>
          <p>A clothing store inspired by India&apos;s favourite fashion app.</p>
        </div>
      </div>
    </footer>
  );
}
