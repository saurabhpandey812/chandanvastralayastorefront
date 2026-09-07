'use client';

interface FilterSidebarProps {
  brands: string[];
  activeBrands: string[];
  onToggleBrand: (brand: string) => void;
  subcategories: string[];
  activeSubcategories: string[];
  onToggleSub: (sub: string) => void;
  priceBand: string;
  onPriceBand: (band: string) => void;
  discountMin: number;
  onDiscountMin: (n: number) => void;
}

const priceBands = [
  { id: 'all', label: 'All prices' },
  { id: '0-999', label: 'Under ₹999' },
  { id: '1000-1999', label: '₹1000 to ₹1999' },
  { id: '2000-4999', label: '₹2000 to ₹4999' },
];

const discounts = [0, 30, 40, 50, 60];

export default function FilterSidebar({
  brands,
  activeBrands,
  onToggleBrand,
  subcategories,
  activeSubcategories,
  onToggleSub,
  priceBand,
  onPriceBand,
  discountMin,
  onDiscountMin,
}: FilterSidebarProps) {
  return (
    <aside className="lg:w-[240px] shrink-0 bg-white border-r border-line">
      <div className="lg:sticky lg:top-[80px] p-4 space-y-6">
        <p className="text-[14px] font-bold uppercase tracking-wide text-ink">Filters</p>

        <div>
          <p className="text-[13px] font-bold text-ink mb-3">Categories</p>
          <ul className="space-y-2">
            {subcategories.map((sub) => (
              <li key={sub}>
                <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeSubcategories.includes(sub)}
                    onChange={() => onToggleSub(sub)}
                    className="accent-myntra"
                  />
                  {sub}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-line pt-5">
          <p className="text-[13px] font-bold text-ink mb-3">Brand</p>
          <ul className="space-y-2 max-h-48 overflow-auto">
            {brands.map((brand) => (
              <li key={brand}>
                <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeBrands.includes(brand)}
                    onChange={() => onToggleBrand(brand)}
                    className="accent-myntra"
                  />
                  {brand}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-line pt-5">
          <p className="text-[13px] font-bold text-ink mb-3">Price</p>
          <ul className="space-y-2">
            {priceBands.map((band) => (
              <li key={band.id}>
                <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    checked={priceBand === band.id}
                    onChange={() => onPriceBand(band.id)}
                    className="accent-myntra"
                  />
                  {band.label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-line pt-5">
          <p className="text-[13px] font-bold text-ink mb-3">Discount</p>
          <ul className="space-y-2">
            {discounts.map((d) => (
              <li key={d}>
                <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer">
                  <input
                    type="radio"
                    name="discount"
                    checked={discountMin === d}
                    onChange={() => onDiscountMin(d)}
                    className="accent-myntra"
                  />
                  {d === 0 ? 'Any discount' : `${d}% and above`}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
