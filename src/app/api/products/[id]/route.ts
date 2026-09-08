import { jsonError, jsonOk } from '@/lib/server/http';
import { getById } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const product = await getById(params.id);
  if (!product) return jsonError('Product not found', 404);
  return jsonOk({ product });
}
