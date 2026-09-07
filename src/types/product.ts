export type Category = 'men' | 'women' | 'kids' | 'ethnic';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  subcategory: string;
  price: number;
  mrp: number;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  material: string;
  fit: string;
  seller: string;
  rating: number;
  ratingCount: number;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Address {
  name: string;
  mobile: string;
  pincode: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  type: 'Home' | 'Work';
}

export interface Order {
  id: string;
  items: CartItem[];
  address: Address;
  paymentMethod: string;
  couponCode?: string;
  discount: number;
  subtotal: number;
  total: number;
  status: 'confirmed' | 'shipped' | 'out-for-delivery' | 'delivered';
  createdAt: string;
}
