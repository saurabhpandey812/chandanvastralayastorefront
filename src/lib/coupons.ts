export const COUPONS: Record<string, { min: number; off: number }> = {
  CHANDAN200: { min: 1499, off: 200 },
  FESTIVE500: { min: 2999, off: 500 },
  FIRST100: { min: 799, off: 100 },
};

export function validateCoupon(code: string, subtotal: number) {
  const upper = code.trim().toUpperCase();
  const deal = COUPONS[upper];
  if (!deal) return { ok: false as const, error: 'Invalid coupon code' };
  if (subtotal < deal.min) {
    return { ok: false as const, error: `Min order ₹${deal.min} required` };
  }
  return { ok: true as const, code: upper, off: deal.off, min: deal.min };
}
