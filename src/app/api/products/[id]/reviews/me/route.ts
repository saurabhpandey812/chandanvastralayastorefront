import { jsonError, jsonOk } from '@/lib/server/http';
import { authedRequest } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/requireUser';
import { getMyReview } from '@/lib/server/reviewDb';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const remote = await authedRequest<{ id?: string } | null>({
    path: `/products/${encodeURIComponent(params.id)}/reviews/me`,
  });
  if (remote.ok) return jsonOk({ review: remote.data });
  if (!remote.unreachable && remote.status !== 401) {
    return jsonError(remote.error || 'Could not load your review', remote.status || 400);
  }

  return jsonOk({ review: await getMyReview(params.id, session.userId) });
}
