import { jsonError } from './http';
import { getSession, type SessionPayload } from './session';

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    return { session: null as SessionPayload | null, error: jsonError('Please log in', 401) };
  }
  return { session, error: null };
}
