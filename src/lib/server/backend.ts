import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  API_ORIGIN,
  API_PREFIX,
  REFRESH_COOKIE,
} from '@/lib/constants';
import { jsonError } from './http';

const TIMEOUT_MS = 8000;

export type TokenPair = { accessToken: string; refreshToken: string };

export type BackendResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  tokens?: TokenPair;
  unreachable: boolean;
};

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production',
  };
}

export function applyApiCookies(res: NextResponse, tokens: TokenPair) {
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOpts(15 * 60));
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOpts(7 * 24 * 60 * 60));
  return res;
}

export function clearApiCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, '', { ...cookieOpts(0), maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, '', { ...cookieOpts(0), maxAge: 0 });
  return res;
}

export function readApiTokens() {
  const jar = cookies();
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_COOKIE)?.value ?? null,
  };
}

function unwrap(payload: unknown): { data: unknown; error: string | null } {
  if (!payload || typeof payload !== 'object') return { data: payload, error: null };
  const body = payload as {
    success?: boolean;
    data?: unknown;
    message?: string | string[];
    error?: string;
  };
  if (body.success === false) {
    const message = Array.isArray(body.message) ? body.message[0] : body.message || body.error;
    return { data: null, error: message || 'Request failed' };
  }
  if (body.success === true && 'data' in body) return { data: body.data, error: null };
  return { data: payload, error: null };
}

async function rawFetch(path: string, init: RequestInit, accessToken?: string | null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = new Headers(init.headers);
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return await fetch(`${API_ORIGIN}${API_PREFIX}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function backendRequest<T>(opts: {
  path: string;
  method?: string;
  body?: unknown;
  accessToken?: string | null;
  refreshToken?: string | null;
}): Promise<BackendResult<T>> {
  const method = opts.method ?? 'GET';
  const init: RequestInit = {
    method,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  };

  try {
    let res = await rawFetch(opts.path, init, opts.accessToken);
    let tokens: TokenPair | undefined;

    if (res.status === 401 && opts.refreshToken) {
      const refreshed = await refreshAccess(opts.refreshToken);
      if (refreshed) {
        tokens = refreshed;
        res = await rawFetch(opts.path, init, refreshed.accessToken);
      }
    }

    const payload = await res.json().catch(() => null);
    const { data, error } = unwrap(payload);
    return {
      ok: res.ok && !error,
      status: res.status,
      data: (data as T) ?? null,
      error: error || (res.ok ? null : 'Request failed'),
      tokens,
      unreachable: false,
    };
  } catch {
    return {
      ok: false,
      status: 502,
      data: null,
      error: 'Service is unavailable',
      unreachable: true,
    };
  }
}

async function refreshAccess(refreshToken: string): Promise<TokenPair | null> {
  try {
    const res = await rawFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const payload = await res.json().catch(() => null);
    const { data } = unwrap(payload);
    const tokens = data as TokenPair | null;
    if (!tokens?.accessToken || !tokens?.refreshToken) return null;
    return tokens;
  } catch {
    return null;
  }
}

export async function authedRequest<T>(opts: {
  path: string;
  method?: string;
  body?: unknown;
}) {
  const { accessToken, refreshToken } = readApiTokens();
  return backendRequest<T>({ ...opts, accessToken, refreshToken });
}

export async function proxyBackend(req: Request, path: string) {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await req.text() : undefined;
  const result = await authedRequest<unknown>({
    path: `${path}${url.search}`,
    method,
    body: body ? safeParse(body) : undefined,
  });
  if (result.unreachable) return jsonError(result.error || 'Service unavailable', 502);
  const res = NextResponse.json(result.ok ? result.data : { error: result.error }, {
    status: result.status,
  });
  if (result.tokens) applyApiCookies(res, result.tokens);
  return res;
}

function safeParse(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
