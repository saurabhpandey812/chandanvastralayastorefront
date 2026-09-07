'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { searchProducts } from '@/lib/data/products';

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const results = useMemo(() => searchProducts(q), [q]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-store mx-auto px-4 py-6">
        <p className="text-[13px] text-muted">Search results</p>
        <h1 className="text-[16px] font-bold mt-1">
          {q ? `"${q}"` : 'All products'}{' '}
          <span className="font-normal text-muted">- {results.length} items</span>
        </h1>
        <div className="mt-6">
          <ProductGrid products={results} />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-muted">Searching...</div>}>
      <SearchResults />
    </Suspense>
  );
}
