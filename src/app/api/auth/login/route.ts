import { jsonError, jsonOk, readJson } from '@/lib/server/http';
import { applyApiCookies, backendRequest } from '@/lib/server/backend';
import { applySessionCookie, createSessionToken } from '@/lib/server/session';
import { findByLogin, toPublic, upsertFromApi, verifyPassword } from '@/lib/server/userDb';
import { syncRegisteredCustomer } from '@/lib/server/adminSync';
import { isValidEmail, loginIdError, passwordError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await readJson<{ id?: string; email?: string; password?: string }>(req);
  const id = (body.id || body.email || '').trim();
  const idErr = loginIdError(id);
  const passErr = passwordError(body.password || '');
  if (idErr || passErr) return jsonError(idErr || passErr || '', 400);

  const local = await findByLogin(id);
  if (local && (await verifyPassword(local, body.password || ''))) {
    const user = toPublic(local);
    const res = jsonOk({ user });
    applySessionCookie(
      res,
      await createSessionToken({ userId: user.id, email: user.email, name: user.name })
    );
    void syncRegisteredCustomer({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      createdAt: user.createdAt,
    });
    return res;
  }

  if (isValidEmail(id)) {
    const nest = await backendRequest<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string; role: string };
    }>({
      path: '/auth/login',
      method: 'POST',
      body: { email: id, password: body.password },
    });
    if (nest.ok && nest.data?.user) {
      const merged = await upsertFromApi({
        id: nest.data.user.id,
        name: nest.data.user.email.split('@')[0],
        email: nest.data.user.email,
      });
      const user = toPublic(merged);
      const res = jsonOk({ user });
      applySessionCookie(
        res,
        await createSessionToken({ userId: user.id, email: user.email, name: user.name })
      );
      if (nest.data.accessToken && nest.data.refreshToken) applyApiCookies(res, nest.data);
      return res;
    }
  }

  return jsonError('Incorrect email/mobile or password', 401);
}
