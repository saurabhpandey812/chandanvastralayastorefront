import { Product } from '@/types/product';
import { products as localCatalog } from '@/lib/data/products';
import { backendRequest } from './backend';

type RemoteProduct = {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  brand: string;
  category: Product['category'];
  subcategory: string;
  price: number;
  mrp: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  description?: string;
  material?: string;
  fit?: string;
  seller?: string;
  rating?: number;
  ratingAverage?: number;
  ratingCount?: number;
  isNew?: boolean;
  status?: string;
};

export function toStoreProduct(p: RemoteProduct): Product {
  return {
    id: String(p.id || p._id),
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    mrp: p.mrp,
    sizes: p.sizes || [],
    colors: p.colors || [],
    images: p.images || [],
    description: p.description || '',
    material: p.material || '',
    fit: p.fit || '',
    seller: p.seller || 'Chandan Vastralaya',
    rating: p.rating ?? p.ratingAverage ?? 0,
    ratingCount: p.ratingCount ?? 0,
    isNew: p.isNew,
  };
}

function localFilter(query: {
  category?: string | null;
  search?: string | null;
  sort?: string | null;
}) {
  let items = localCatalog.filter((p) => {
    if (query.category && query.category !== 'all' && p.category !== query.category) return false;
    const search = (query.search || '').trim().toLowerCase();
    if (!search) return true;
    return (
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.subcategory.toLowerCase().includes(search)
    );
  });
  if (query.sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
  if (query.sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
  if (query.sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
  return items;
}

export async function listCatalog(query: {
  category?: string | null;
  search?: string | null;
  sort?: string | null;
  page?: string | null;
  limit?: string | null;
}) {
  if (query.category === 'ethnic') {
    const products = localFilter(query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 24));
    const start = (page - 1) * limit;
    return {
      products: products.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total: products.length,
        totalPages: Math.ceil(products.length / limit),
      },
      source: 'local' as const,
    };
  }

  const qs = new URLSearchParams();
  if (query.category && query.category !== 'ethnic') qs.set('category', query.category);
  if (query.search) qs.set('search', query.search);
  if (query.sort) qs.set('sort', query.sort);
  if (query.page) qs.set('page', query.page);
  if (query.limit) qs.set('limit', query.limit);

  const remote = await backendRequest<{ items?: RemoteProduct[]; pagination?: unknown }>({
    path: `/products${qs.toString() ? `?${qs}` : ''}`,
  });

  if (!remote.unreachable && remote.ok && Array.isArray(remote.data?.items)) {
    return {
      products: remote.data.items.map(toStoreProduct),
      pagination: remote.data.pagination,
      source: 'api' as const,
    };
  }

  const products = localFilter(query);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 24));
  const start = (page - 1) * limit;
  return {
    products: products.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: products.length,
      totalPages: Math.ceil(products.length / limit),
    },
    source: 'local' as const,
  };
}

export async function getBySlug(slug: string) {
  const remote = await backendRequest<RemoteProduct>({ path: `/products/slug/${encodeURIComponent(slug)}` });
  if (!remote.unreachable && remote.ok && remote.data) return toStoreProduct(remote.data);
  return localCatalog.find((p) => p.slug === slug) ?? null;
}

export async function getById(id: string) {
  if (/^[a-f\d]{24}$/i.test(id)) {
    const remote = await backendRequest<RemoteProduct>({ path: `/products/${encodeURIComponent(id)}` });
    if (!remote.unreachable && remote.ok && remote.data) return toStoreProduct(remote.data);
  }
  return localCatalog.find((p) => p.id === id) ?? null;
}
