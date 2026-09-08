import { jsonError, jsonOk } from '@/lib/server/http';
import { authedRequest, readApiTokens } from '@/lib/server/backend';
import { getSession } from '@/lib/server/session';
import { findByIdOrEmail, toPublic, upsertFromApi } from '@/lib/server/userDb';
import { PublicUser } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  const local = session ? await findByIdOrEmail(session.userId, session.email) : null;
  const { accessToken } = readApiTokens();

  if (accessToken) {
    const remote = await authedRequest<{
      _id?: string;
      id?: string;
      name: string;
      email: string;
      mobile?: string;
      gender?: PublicUser['gender'];
    }>({ path: '/users/me' });

    if (remote.ok && remote.data) {
      const merged = await upsertFromApi({
        id: String(remote.data.id || remote.data._id),
        name: remote.data.name,
        email: remote.data.email,
        mobile: remote.data.mobile || local?.mobile,
        gender: remote.data.gender || local?.gender,
      });
      return jsonOk(toPublic(merged));
    }
  }

  if (local) return jsonOk(toPublic(local));
  return jsonError('Unauthorized', 401);
}
