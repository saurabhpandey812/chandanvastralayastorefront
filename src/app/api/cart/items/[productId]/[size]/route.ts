import { jsonError, jsonOk, readJson } from '@/lib/server/http';
import { authedRequest } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/requireUser';
import { updateCartItem } from '@/lib/server/cartDb';

export const dynamic = 'force-dynamic';

type Ctx = { params: { productId: string; size: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const body = await readJson<{ quantity?: number }>(req);
  const quantity = Number(body.quantity);

  const remote = await authedRequest<unknown>({
    path: `/cart/items/${encodeURIComponent(params.productId)}/${encodeURIComponent(params.size)}`,
    method: 'PATCH',
    body: { quantity },
  });
  if (remote.ok) return jsonOk({ cart: remote.data, source: 'api' });
  if (!remote.unreachable && remote.status !== 401) {
    return jsonError(remote.error || 'Could not update bag', remote.status);
  }

  try {
    const cart = await updateCartItem(session.userId, params.productId, params.size, quantity);
    return jsonOk({ cart, source: 'local' });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Could not update bag', 400);
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const remote = await authedRequest<unknown>({
    path: `/cart/items/${encodeURIComponent(params.productId)}/${encodeURIComponent(params.size)}`,
    method: 'DELETE',
  });
  if (remote.ok) return jsonOk({ cart: remote.data, source: 'api' });

  const cart = await updateCartItem(session.userId, params.productId, params.size, 0);
  return jsonOk({ cart, source: 'local' });
}
