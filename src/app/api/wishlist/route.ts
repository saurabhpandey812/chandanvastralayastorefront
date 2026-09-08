import { jsonError, jsonOk, readJson } from '@/lib/server/http';
import { requireUser } from '@/lib/server/requireUser';
import { getWishlist, removeWishlist, toggleWishlist } from '@/lib/server/wishlistDb';
import { Product } from '@/types/product';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const items = await getWishlist(session.userId);
  return jsonOk({ items });
}

export async function POST(req: Request) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const body = await readJson<{ product?: Product }>(req);
  if (!body.product?.id) return jsonError('Product is required', 400);
  const items = await toggleWishlist(session.userId, body.product);
  return jsonOk({ items });
}

export async function DELETE(req: Request) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const id = new URL(req.url).searchParams.get('productId');
  if (!id) return jsonError('Product id is required', 400);
  const items = await removeWishlist(session.userId, id);
  return jsonOk({ items });
}
