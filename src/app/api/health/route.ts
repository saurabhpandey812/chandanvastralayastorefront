import { jsonOk } from '@/lib/server/http';
import { backendRequest } from '@/lib/server/backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  const remote = await backendRequest<{ status?: string; timestamp?: string }>({ path: '/health' });
  return jsonOk({
    status: remote.ok ? 'ok' : 'degraded',
    storefront: 'ok',
    api: remote.ok ? remote.data : 'unreachable',
  });
}
