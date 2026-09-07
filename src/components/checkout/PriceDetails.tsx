import { formatInr } from '@/lib/format';

interface PriceDetailsProps {
  mrp: number;
  price: number;
  coupon: number;
  convenience?: number;
}

export default function PriceDetails({
  mrp,
  price,
  coupon,
  convenience = 0,
}: PriceDetailsProps) {
  const discountOnMrp = mrp - price;
  const total = price - coupon + convenience;

  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-wider text-ink-soft mb-4">
        Price Details
      </p>
      <div className="space-y-3 text-[14px] text-ink">
        <div className="flex justify-between">
          <span>Total MRP</span>
          <span>{formatInr(mrp)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount on MRP</span>
          <span className="text-forest">- {formatInr(discountOnMrp)}</span>
        </div>
        <div className="flex justify-between">
          <span>Coupon Discount</span>
          <span className={coupon ? 'text-forest' : 'text-myntra'}>
            {coupon ? `- ${formatInr(coupon)}` : 'Apply Coupon'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Convenience Fee</span>
          <span>
            {convenience === 0 ? (
              <>
                <span className="line-through text-muted mr-1">₹99</span>
                <span className="text-forest">FREE</span>
              </>
            ) : (
              formatInr(convenience)
            )}
          </span>
        </div>
        <div className="flex justify-between pt-3 border-t border-dashed border-line font-bold">
          <span>Total Amount</span>
          <span>{formatInr(total)}</span>
        </div>
      </div>
    </div>
  );
}
