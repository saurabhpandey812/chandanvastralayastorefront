export function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function discountPercent(price: number, mrp: number) {
  return Math.round(((mrp - price) / mrp) * 100);
}
