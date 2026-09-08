import { Address, CartItem, Category, Order } from '@/types/product';

type ApiProduct = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  brand?: string;
  category?: Category;
  subcategory?: string;
  price?: number;
  mrp?: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  seller?: string;
};

export type ApiOrder = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  items?: Array<{
    product?: ApiProduct | string;
    productName?: string;
    size?: string;
    color?: string;
    quantity?: number;
    price?: number;
  }>;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
  paymentMethod?: string;
  total?: number;
  status?: string;
  shippingAddress?: {
    name?: string;
    mobile?: string;
    line?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt?: string;
};

const STATUS: Record<string, Order['status']> = {
  pending: 'confirmed',
  confirmed: 'confirmed',
  shipped: 'shipped',
  'out-for-delivery': 'out-for-delivery',
  delivered: 'delivered',
};

function asProduct(raw: ApiProduct | string | undefined, fallbackName: string, price: number, size: string): CartItem['product'] {
  const product = raw && typeof raw === 'object' ? raw : {};
  const images = Array.isArray(product.images) && product.images.length ? product.images : ['/logo.png'];
  return {
    id: String(product._id || product.id || (typeof raw === 'string' ? raw : '')),
    slug: product.slug || '',
    name: product.name || fallbackName || 'Item',
    brand: product.brand || '',
    category: product.category || 'women',
    subcategory: product.subcategory || '',
    price: product.price || price,
    mrp: product.mrp || price,
    sizes: product.sizes?.length ? product.sizes : [size],
    colors: product.colors || [],
    images,
    description: '',
    material: '',
    fit: '',
    seller: product.seller || '',
    rating: 0,
    ratingCount: 0,
  };
}

export function mapApiOrder(raw: ApiOrder, fallback?: Address | null): Order {
  const addr = raw.shippingAddress || {};
  return {
    id: String(raw.orderNumber || raw._id || raw.id || `ORD-${Date.now()}`),
    items: (raw.items || []).map((item) => {
      const price = Number(item.price) || 0;
      const size = item.size || '';
      return {
        product: asProduct(item.product, item.productName || 'Item', price, size),
        size,
        quantity: Number(item.quantity) || 1,
      };
    }),
    address: {
      name: addr.name || fallback?.name || '',
      mobile: addr.mobile || fallback?.mobile || '',
      pincode: addr.pincode || fallback?.pincode || '',
      address: addr.line || fallback?.address || '',
      locality: fallback?.locality || '',
      city: addr.city || fallback?.city || '',
      state: addr.state || fallback?.state || '',
      type: fallback?.type || 'Home',
    },
    paymentMethod: raw.paymentMethod || 'Cash on Delivery',
    couponCode: raw.couponCode || undefined,
    discount: Number(raw.discount) || 0,
    subtotal: Number(raw.subtotal) || 0,
    total: Number(raw.total) || 0,
    status: STATUS[raw.status || 'pending'] || 'confirmed',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}
