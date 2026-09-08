import { jsonFile } from './jsonFile';
import { summarizeRatings, type ReviewSummary } from '@/lib/reviewStats';

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

const store = jsonFile<ProductReview[]>('reviews.json', []);

function publicReview(row: ProductReview) {
  return {
    id: row.id,
    userName: row.userName,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    images: row.images || [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listReviews(productId: string, page = 1, limit = 20) {
  const rows = (await store.read()).filter((row) => row.productId === productId);
  rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const summary = summarizeRatings(rows.map((row) => row.rating));
  const start = (page - 1) * limit;
  return {
    items: rows.slice(start, start + limit).map(publicReview),
    summary,
    pagination: {
      page,
      limit,
      total: summary.count,
      totalPages: Math.ceil(summary.count / limit) || 1,
    },
  };
}

export async function getMyReview(productId: string, userId: string) {
  const rows = await store.read();
  const mine = rows.find((row) => row.productId === productId && row.userId === userId);
  return mine ? publicReview(mine) : null;
}

export async function upsertReview(input: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}) {
  const now = new Date().toISOString();
  const images = input.images || [];
  const title = input.title || '';
  let saved: ProductReview | null = null;
  await store.update((rows) => {
    const idx = rows.findIndex(
      (row) => row.productId === input.productId && row.userId === input.userId
    );
    if (idx >= 0) {
      const next = {
        ...rows[idx],
        userName: input.userName,
        rating: input.rating,
        title,
        comment: input.comment,
        images,
        updatedAt: now,
      };
      const copy = [...rows];
      copy[idx] = next;
      saved = next;
      return copy;
    }
    const created: ProductReview = {
      id: `rev-${Date.now().toString(36)}`,
      productId: input.productId,
      userId: input.userId,
      userName: input.userName,
      rating: input.rating,
      title,
      comment: input.comment,
      images,
      createdAt: now,
      updatedAt: now,
    };
    saved = created;
    return [created, ...rows];
  });
  const listed = await listReviews(input.productId);
  return { review: saved ? publicReview(saved) : null, summary: listed.summary as ReviewSummary };
}
