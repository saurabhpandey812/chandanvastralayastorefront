import { NextResponse } from 'next/server';

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function readJson<T>(req: Request): Promise<T> {
  return ((await req.json().catch(() => ({}))) ?? {}) as T;
}

export function searchParams(req: Request) {
  return new URL(req.url).searchParams;
}
