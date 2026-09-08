import { jsonError, jsonOk } from '@/lib/server/http';
import { authedRequest } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/requireUser';
import { getOrder } from '@/lib/server/orderDb';
import { mapApiOrder, type ApiOrder } from '@/lib/mapOrder';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const remote = await authedRequest<ApiOrder>({ path: `/orders/${encodeURIComponent(params.id)}` });
  if (remote.ok && remote.data) return jsonOk({ order: mapApiOrder(remote.data), source: 'api' });
  if (!remote.unreachable && remote.status === 404) return jsonError('Order not found', 404);

  const order = await getOrder(session.userId, params.id);
  if (!order) return jsonError('Order not found', 404);
  return jsonOk({ order, source: 'local' });
}
