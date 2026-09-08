import { proxyBackend } from '@/lib/server/backend';

export const dynamic = 'force-dynamic';

function pathFrom(params: { path: string[] }) {
  return `/${params.path.join('/')}`;
}

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  return proxyBackend(req, pathFrom(ctx.params));
}

export async function POST(req: Request, ctx: { params: { path: string[] } }) {
  return proxyBackend(req, pathFrom(ctx.params));
}

export async function PATCH(req: Request, ctx: { params: { path: string[] } }) {
  return proxyBackend(req, pathFrom(ctx.params));
}

export async function PUT(req: Request, ctx: { params: { path: string[] } }) {
  return proxyBackend(req, pathFrom(ctx.params));
}

export async function DELETE(req: Request, ctx: { params: { path: string[] } }) {
  return proxyBackend(req, pathFrom(ctx.params));
}
