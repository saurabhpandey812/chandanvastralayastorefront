import { jsonError, jsonOk } from '@/lib/server/http';
import { authedRequest } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/requireUser';
import { clearCart, getCart } from '@/lib/server/cartDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const remote = await authedRequest<unknown>({ path: '/cart' });
  if (remote.ok) return jsonOk({ cart: remote.data, source: 'api' });

  const cart = await getCart(session.userId);
  return jsonOk({ cart, source: 'local' });
}

export async function DELETE() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const remote = await authedRequest<unknown>({ path: '/cart', method: 'DELETE' });
  if (remote.ok) return jsonOk({ cart: remote.data, source: 'api' });
  if (!remote.unreachable && remote.status !== 401) {
    return jsonError(remote.error || 'Could not clear cart', remote.status);
  }

  const cart = await clearCart(session.userId);
  return jsonOk({ cart, source: 'local' });
}
