import { jsonError, jsonOk, readJson } from '@/lib/server/http';
import { authedRequest } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/requireUser';
import { getCart, clearCart } from '@/lib/server/cartDb';
import { createOrder } from '@/lib/server/orderDb';
import { listOrders as listLocalOrders } from '@/lib/server/orderDb';
import { syncCustomerOrder } from '@/lib/server/adminSync';
import { findById } from '@/lib/server/userDb';
import { getById, getBySlug } from '@/lib/server/catalog';
import { products as localCatalog } from '@/lib/data/products';
import { Address } from '@/types/product';
import {
  addressLineError,
  cityError,
  pincodeError,
} from '@/lib/validation';
import { mapApiOrder, type ApiOrder } from '@/lib/mapOrder';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const remote = await authedRequest<ApiOrder[]>({ path: '/orders/mine' });
  if (remote.ok && Array.isArray(remote.data)) {
    return jsonOk({ orders: remote.data.map((row) => mapApiOrder(row)), source: 'api' });
  }

  const orders = await listLocalOrders(session.userId);
  return jsonOk({ orders, source: 'local' });
}

export async function POST(req: Request) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const body = await readJson<{
    address?: Address;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
    paymentMethod?: string;
    couponCode?: string;
    discount?: number;
    subtotal?: number;
    total?: number;
    items?: Array<{
      productId?: string;
      slug?: string;
      size?: string;
      color?: string;
      quantity?: number;
    }>;
  }>(req);

  const addressLine = body.address?.address || body.addressLine || '';
  const city = body.address?.city || body.city || '';
  const state = body.address?.state || body.state || '';
  const pincode = body.address?.pincode || body.pincode || '';
  const items = Array.isArray(body.items)
    ? body.items.filter((item) => (item.productId || item.slug) && item.size && Number(item.quantity) > 0)
    : [];

  const addrErr = addressLineError(addressLine);
  const cityErr = cityError(city);
  const pinErr = pincodeError(pincode);
  if (addrErr || cityErr || pinErr) return jsonError(addrErr || cityErr || pinErr || '', 400);

  const remote = await authedRequest<unknown>({
    path: '/orders',
    method: 'POST',
    body: {
      addressLine,
      city,
      state,
      pincode,
      name: body.address?.name,
      mobile: body.address?.mobile,
      paymentMethod: body.paymentMethod,
      couponCode: body.couponCode,
      discount: Number(body.discount) || 0,
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        size: item.size,
        color: item.color,
        quantity: Number(item.quantity) || 1,
      })),
    },
  });
  if (remote.ok) {
    try {
      const mapped = mapApiOrder((remote.data || {}) as ApiOrder, body.address);
      await afterOrder(session.userId, Number(body.total) || mapped.total, {
        addressLine,
        city,
        state,
        pincode,
      });
      return jsonOk({ order: mapped, source: 'api' }, 201);
    } catch {
      // Order may already exist in Mongo; keep going to a local confirmation.
    }
  }
  if (!remote.ok && !remote.unreachable && remote.status !== 401 && remote.status < 500) {
    return jsonError(remote.error || 'Could not place order', remote.status);
  }

  try {
    const cartItems = [];
    for (const item of items) {
      const product =
        localCatalog.find((row) => item.slug && row.slug === item.slug) ||
        localCatalog.find((row) => item.productId && row.id === item.productId) ||
        (item.slug ? await getBySlug(item.slug) : null) ||
        (item.productId ? await getById(item.productId) : null);
      if (product) {
        cartItems.push({
          product,
          size: item.size || '',
          quantity: Number(item.quantity) || 1,
        });
      }
    }
    const serverCart = cartItems.length ? { items: cartItems } : await getCart(session.userId);
    if (serverCart.items.length === 0) {
      return jsonError(remote.error || 'Your cart is empty', remote.unreachable ? 502 : 400);
    }
    if (!body.address) return jsonError('Shipping address is required', 400);

    const order = await createOrder({
      userId: session.userId,
      items: serverCart.items,
      address: body.address,
      paymentMethod: body.paymentMethod || 'COD',
      couponCode: body.couponCode,
      discount: Number(body.discount) || 0,
      subtotal: Number(body.subtotal) || 0,
      total: Number(body.total) || 0,
    });
    await clearCart(session.userId);
    await afterOrder(session.userId, order.total, { addressLine, city, state, pincode });
    return jsonOk({ order, source: 'local' }, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Could not place order', 500);
  }
}

async function afterOrder(
  userId: string,
  total: number,
  address: { addressLine: string; city: string; state: string; pincode: string }
) {
  try {
    const user = await findById(userId);
    if (!user) return;
    await syncCustomerOrder({
      email: user.email,
      name: user.name,
      mobile: user.mobile,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address: address.addressLine,
      total,
    });
  } catch {
    // Admin customer sync is best-effort.
  }
}
