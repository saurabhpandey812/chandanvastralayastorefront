import { jsonError, jsonOk, readJson } from '@/lib/server/http';
import { applyApiCookies, authedRequest } from '@/lib/server/backend';
import { applySessionCookie, createSessionToken, getSession } from '@/lib/server/session';
import { toPublic, updateUser } from '@/lib/server/userDb';
import { syncRegisteredCustomer } from '@/lib/server/adminSync';
import { PublicUser } from '@/types/auth';
import { emailError, mobileError, passwordError, personNameError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const genders: NonNullable<PublicUser['gender']>[] = ['Male', 'Female', 'Other'];

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Unauthorized', 401);

  const body = await readJson<{
    name?: string;
    email?: string;
    mobile?: string;
    gender?: PublicUser['gender'];
    currentPassword?: string;
    newPassword?: string;
  }>(req);

  const nameErr = personNameError(body.name || '');
  const mailErr = emailError(body.email || '');
  const phoneErr = mobileError(body.mobile || '');
  if (nameErr || mailErr || phoneErr) {
    return jsonError(nameErr || mailErr || phoneErr || '', 400);
  }
  if (body.gender && !genders.includes(body.gender)) {
    return jsonError('Choose a valid gender', 400);
  }
  if (body.newPassword || body.currentPassword) {
    const currentErr = passwordError(body.currentPassword || '');
    const newErr = passwordError(body.newPassword || '', { requiredStrong: true });
    if (currentErr) return jsonError(currentErr, 400);
    if (newErr) return jsonError(newErr, 400);
  }

  try {
    const user = await updateUser(
      session.userId,
      {
        name: body.name!,
        email: body.email!,
        mobile: body.mobile!,
        gender: body.gender,
        currentPassword: body.newPassword ? body.currentPassword : undefined,
        newPassword: body.newPassword || undefined,
      },
      session.email
    );
    if (!user) return jsonError('Could not save profile', 400);

    const remote = await authedRequest<{
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
      mobile?: string;
      gender?: PublicUser['gender'];
    }>({
      path: '/users/me',
      method: 'PATCH',
      body: {
        name: body.name,
        email: body.email,
        mobile: body.mobile,
        gender: body.gender,
        currentPassword: body.newPassword ? body.currentPassword : undefined,
        newPassword: body.newPassword || undefined,
      },
    });

    const profile = toPublic(user);
    const res = jsonOk(profile);
    applySessionCookie(
      res,
      await createSessionToken({ userId: profile.id, email: profile.email, name: profile.name })
    );
    if (remote.tokens) applyApiCookies(res, remote.tokens);
    void syncRegisteredCustomer({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      mobile: profile.mobile,
      createdAt: profile.createdAt,
    });
    return res;
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Could not save profile', 400);
  }
}
