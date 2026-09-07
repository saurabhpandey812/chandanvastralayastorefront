'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import FilterSidebar from '@/components/product/FilterSidebar';
import ProductGrid from '@/components/product/ProductGrid';
import { getProductsByCategory } from '@/lib/data/products';
import { discountPercent } from '@/lib/format';

const categoryLabels: Record<string, string> = {
  all: 'Clothing',
  men: 'Men Clothing',
  women: 'Women Clothing',
  kids: 'Kids Clothing',
  ethnic: 'Ethnic Wear',
  studio: 'Studio Looks',
};

export default function CategoryPage() {
  const params = useParams();
  const category = (params.category as string) || 'all';
  const baseProducts = useMemo(() => getProductsByCategory(category), [category]);

  const subcategories = useMemo(
    () => Array.from(new Set(baseProducts.map((p) => p.subcategory))),
    [baseProducts]
  );
  const brands = useMemo(
    () => Array.from(new Set(baseProducts.map((p) => p.brand))).sort(),
    [baseProducts]
  );

  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [priceBand, setPriceBand] = useState('all');
  const [discountMin, setDiscountMin] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');

  const filteredProducts = useMemo(() => {
    let list = baseProducts;
    if (activeSubcategories.length) {
      list = list.filter((p) => activeSubcategories.includes(p.subcategory));
    }
    if (activeBrands.length) {
      list = list.filter((p) => activeBrands.includes(p.brand));
    }
    if (priceBand !== 'all') {
      const [min, max] = priceBand.split('-').map(Number);
      list = list.filter((p) => p.price >= min && p.price <= max);
    }
    if (discountMin > 0) {
      list = list.filter((p) => discountPercent(p.price, p.mrp) >= discountMin);
    }
    const sorted = [...list];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'discount') {
      sorted.sort(
        (a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp)
      );
    }
    if (sortBy === 'newest') {
      sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    }
    return sorted;
  }, [baseProducts, activeSubcategories, activeBrands, priceBand, discountMin, sortBy]);

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-line px-4 py-4">
        <p className="text-[13px] text-muted">
          Home / {categoryLabels[category] ?? category}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
          <h1 className="text-[16px] font-bold text-ink">
            {categoryLabels[category] ?? category}{' '}
            <span className="font-normal text-muted">
              - {filteredProducts.length} items
            </span>
          </h1>
          <label className="flex items-center gap-2 text-[13px] border border-line rounded px-3 py-2 w-full sm:w-auto">
            <span className="text-muted">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-bold outline-none bg-transparent"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">What&apos;s New</option>
              <option value="rating">Customer Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Better Discount</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <FilterSidebar
          brands={brands}
          activeBrands={activeBrands}
          onToggleBrand={(b) =>
            setActiveBrands((prev) =>
              prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
            )
          }
          subcategories={subcategories}
          activeSubcategories={activeSubcategories}
          onToggleSub={(s) =>
            setActiveSubcategories((prev) =>
              prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
            )
          }
          priceBand={priceBand}
          onPriceBand={setPriceBand}
          discountMin={discountMin}
          onDiscountMin={setDiscountMin}
        />
        <div className="flex-1 p-4">
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}
