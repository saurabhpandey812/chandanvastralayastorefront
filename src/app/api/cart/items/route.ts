import { jsonError, jsonOk, readJson } from '@/lib/server/http';
import { authedRequest } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/requireUser';
import { addCartItem } from '@/lib/server/cartDb';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const body = await readJson<{ productId?: string; size?: string; quantity?: number }>(req);
  if (!body.productId || !body.size) return jsonError('Product and size are required', 400);

  const remote = await authedRequest<unknown>({
    path: '/cart/items',
    method: 'POST',
    body: {
      productId: body.productId,
      size: body.size,
      quantity: Number(body.quantity) || 1,
    },
  });
  if (remote.ok) return jsonOk({ cart: remote.data, source: 'api' });
  if (!remote.unreachable && remote.status !== 401) {
    return jsonError(remote.error || 'Could not add to bag', remote.status);
  }

  try {
    const cart = await addCartItem(session.userId, body.productId, body.size, Number(body.quantity) || 1);
    return jsonOk({ cart, source: 'local' });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Could not add to bag', 400);
  }
}
