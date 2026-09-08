import { jsonError, jsonOk, readJson } from '@/lib/server/http';
import { applyApiCookies, backendRequest } from '@/lib/server/backend';
import { applySessionCookie, createSessionToken } from '@/lib/server/session';
import {
  createUser,
  toPublic,
  upsertFromApi,
} from '@/lib/server/userDb';
import { syncRegisteredCustomer } from '@/lib/server/adminSync';
import { emailError, mobileError, passwordError, personNameError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await readJson<{
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
  }>(req);

  const nameErr = personNameError(body.name || '');
  const mailErr = emailError(body.email || '');
  const phoneErr = mobileError(body.mobile || '');
  const passErr = passwordError(body.password || '', { requiredStrong: true });
  const first = nameErr || mailErr || phoneErr || passErr;
  if (first) return jsonError(first, 400);

  try {
    const local = await createUser({
      name: body.name!,
      email: body.email!,
      mobile: body.mobile!,
      password: body.password!,
    });

    const nest = await backendRequest<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string; role: string };
    }>({
      path: '/auth/register',
      method: 'POST',
      body: { name: body.name, email: body.email, password: body.password },
    });

    let user = toPublic(local);
    if (nest.ok && nest.data?.user) {
      const merged = await upsertFromApi({
        id: nest.data.user.id,
        name: local.name,
        email: nest.data.user.email,
        mobile: local.mobile,
      });
      user = toPublic(merged);
    }

    const res = jsonOk({ user }, 201);
    applySessionCookie(
      res,
      await createSessionToken({ userId: user.id, email: user.email, name: user.name })
    );
    if (nest.ok && nest.data?.accessToken && nest.data.refreshToken) {
      applyApiCookies(res, nest.data);
    }

    void syncRegisteredCustomer({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      createdAt: user.createdAt,
    });

    return res;
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Could not create account', 409);
  }
}