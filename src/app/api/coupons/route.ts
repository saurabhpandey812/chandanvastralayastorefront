import { jsonError, jsonOk, readJson, searchParams } from '@/lib/server/http';
import { COUPONS, validateCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function GET() {
  const coupons = Object.entries(COUPONS).map(([code, deal]) => ({
    code,
    off: deal.off,
    min: deal.min,
  }));
  return jsonOk({ coupons });
}

export async function POST(req: Request) {
  const body = await readJson<{ code?: string; subtotal?: number }>(req);
  const subtotal = Number(searchParams(req).get('subtotal') || body.subtotal || 0);
  const result = validateCoupon(body.code || '', subtotal);
  if (!result.ok) return jsonError(result.error, 400);
  return jsonOk({ coupon: { code: result.code, off: result.off, min: result.min } });
}
