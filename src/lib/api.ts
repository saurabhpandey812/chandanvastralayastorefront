type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string; status: number };

export async function api<T>(path: string, init?: RequestInit): Promise<ApiOk<T> | ApiErr> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(path, { ...init, headers, credentials: 'include' });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error || 'Request failed', status: res.status };
  }
  return { ok: true, data };
}
