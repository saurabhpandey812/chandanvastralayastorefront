import { jsonError, jsonOk } from '@/lib/server/http';
import { getBySlug } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const product = await getBySlug(params.slug);
  if (!product) return jsonError('Product not found', 404);
  return jsonOk({ product });
}
