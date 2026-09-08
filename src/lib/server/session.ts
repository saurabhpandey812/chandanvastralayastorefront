import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_SECRET } from '@/lib/constants';

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  exp: number;
};

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sign(body: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return toHex(sig).slice(0, 32);
}

export async function hashSecret(value: string) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${SESSION_SECRET}:${value}`)
  );
  return toHex(buf);
}

export async function createSessionToken(input: { userId: string; email: string; name: string }) {
  const payload: SessionPayload = {
    userId: input.userId,
    email: input.email,
    name: input.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const body = btoa(JSON.stringify(payload));
  const sig = await sign(body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = await sign(body);
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(atob(body)) as SessionPayload;
    if (!payload.userId || !payload.email || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function applySessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
