import { jsonOk, searchParams } from '@/lib/server/http';
import { listCatalog } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const q = searchParams(req);
  const result = await listCatalog({
    category: q.get('category'),
    search: q.get('search'),
    sort: q.get('sort'),
    page: q.get('page'),
    limit: q.get('limit'),
  });
  return jsonOk(result);
}
