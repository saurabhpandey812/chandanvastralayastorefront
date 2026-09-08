import { jsonError, jsonOk, readJson, searchParams } from '@/lib/server/http';
import { authedRequest, backendRequest } from '@/lib/server/backend';
import { requireUser } from '@/lib/server/requireUser';
import { getMyReview, listReviews, upsertReview } from '@/lib/server/reviewDb';
import { collapseSpaces, reviewCommentError, reviewImagesError, reviewRatingError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type ReviewPayload = {
  items?: unknown[];
  summary?: unknown;
  pagination?: unknown;
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const q = searchParams(req);
  const page = q.get('page') || '1';
  const limit = q.get('limit') || '20';
  const remote = await backendRequest<ReviewPayload>({
    path: `/products/${encodeURIComponent(params.id)}/reviews?page=${page}&limit=${limit}`,
  });
  if (remote.ok && remote.data) return jsonOk(remote.data);
  if (!remote.unreachable && remote.status === 400) {
    return jsonError(remote.error || 'Could not load reviews', 400);
  }

  const listed = await listReviews(params.id, Number(page) || 1, Number(limit) || 20);
  return jsonOk(listed);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const body = await readJson<{ rating?: number; comment?: string; images?: string[] }>(req);
  const rating = Number(body.rating);
  const comment = collapseSpaces(body.comment || '');
  const images = Array.isArray(body.images) ? body.images.map((src) => String(src).trim()).filter(Boolean) : [];
  const ratingErr = reviewRatingError(rating);
  if (ratingErr) return jsonError(ratingErr, 400);
  const commentErr = reviewCommentError(comment);
  if (commentErr) return jsonError(commentErr, 400);
  const imageErr = reviewImagesError(images);
  if (imageErr) return jsonError(imageErr, 400);

  const remote = await authedRequest<{ review?: unknown; summary?: unknown }>({
    path: `/products/${encodeURIComponent(params.id)}/reviews`,
    method: 'POST',
    body: { rating, comment, images },
  });
  if (remote.ok && remote.data) return jsonOk(remote.data);
  if (!remote.unreachable && remote.status === 400) {
    return jsonError(remote.error || 'Could not save review', 400);
  }

  const local = await upsertReview({
    productId: params.id,
    userId: session.userId,
    userName: session.name,
    rating,
    comment,
    images,
  });
  return jsonOk(local);
}
