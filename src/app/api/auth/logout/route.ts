import { jsonOk } from '@/lib/server/http';
import { authedRequest, clearApiCookies } from '@/lib/server/backend';
import { clearSessionCookie } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  await authedRequest({ path: '/auth/logout', method: 'POST' });
  const res = jsonOk({ ok: true });
  clearSessionCookie(res);
  return clearApiCookies(res);
}
