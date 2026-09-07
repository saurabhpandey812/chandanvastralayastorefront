'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
} from 'lucide-react';
import PriceDetails from '@/components/checkout/PriceDetails';
import RequireAuth from '@/components/auth/RequireAuth';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useHydrated } from '@/store/hydrate';
import { useAuthStore } from '@/store/authStore';
import { formatInr } from '@/lib/format';
import { syncCustomerOrder } from '@/lib/adminSync';
import {
  cardExpiryError,
  cardNameError,
  cardNumberError,
  cvvError,
  formatCardNumber,
  formatExpiry,
  onlyDigits,
  onlyNameChars,
  upiError,
} from '@/lib/validation';

const methods = [
  { id: 'cod', label: 'Cash On Delivery (Cash/UPI)', icon: Banknote },
  { id: 'upi', label: 'UPI (PhonePe / Google Pay / Paytm)', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark },
  { id: 'wallet', label: 'Wallets', icon: Wallet },
];

export default function PaymentPage() {
  return (
    <RequireAuth>
      <PaymentContent />
    </RequireAuth>
  );
}

function PaymentContent() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const mrp = useCartStore((s) => s.totalMrp());
  const price = useCartStore((s) => s.totalPrice());
  const couponOff = useCartStore((s) => s.couponDiscount());
  const coupon = useCartStore((s) => s.coupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const address = useOrderStore((s) => s.address);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const user = useAuthStore((s) => s.user);
  const hydrated = useHydrated((s) => s.hydrated);
  const [method, setMethod] = useState('cod');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upi, setUpi] = useState('');
  const [bank, setBank] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (hydrated && !done && (!address || items.length === 0)) router.replace('/cart');
  }, [hydrated, address, items.length, router, done]);

  if (!hydrated) return <div className="p-10 text-muted">Loading...</div>;

  if (done) {
    return (
      <div className="p-10 text-center">
        <p className="font-bold text-forest">Payment successful</p>
        <p className="text-sm text-muted mt-1">Taking you to order confirmation...</p>
      </div>
    );
  }

  if (!address || items.length === 0) {
    return <div className="p-10 text-muted">Redirecting to bag...</div>;
  }

  const total = price - couponOff;

  function pay() {
    if (method === 'upi') {
      const err = upiError(upi);
      if (err) {
        setError(err);
        return;
      }
    }
    if (method === 'card') {
      const errs = [
        cardNumberError(card.number),
        cardNameError(card.name),
        cardExpiryError(card.expiry),
        cvvError(card.cvv),
      ].filter(Boolean);
      if (errs.length) {
        setError(errs[0] as string);
        return;
      }
    }
    if (method === 'netbanking' && !bank) {
      setError('Select a bank to continue');
      return;
    }
    setError('');
    setBusy(true);
    const labels: Record<string, string> = {
      cod: 'Cash on Delivery',
      upi: `UPI (${upi})`,
      card: `Card ending ${card.number.slice(-4) || '0000'}`,
      netbanking: bank ? `Net Banking (${bank})` : 'Net Banking',
      wallet: 'Wallet',
    };
    const order = placeOrder({
      items,
      paymentMethod: labels[method],
      couponCode: coupon ?? undefined,
      discount: couponOff,
      subtotal: price,
      total,
    });
    if (!order) {
      setBusy(false);
      setError('Could not place order. Check address and bag.');
      return;
    }
    if (user && address) {
      void syncCustomerOrder({
        email: user.email,
        name: address.name || user.name,
        mobile: address.mobile || user.mobile,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        address: address.address,
        total,
      });
    }
    setDone(true);
    clearCart();
    router.replace(`/payment/success?orderId=${order.id}`);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
      <div className="bg-white border border-line">
        <div className="p-4 border-b border-line">
          <p className="text-[12px] font-bold uppercase text-ink-soft">Choose Payment Mode</p>
        </div>
        <div className="grid md:grid-cols-[220px_1fr]">
          <div className="border-r border-line">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setError('');
                }}
                className={`w-full flex items-center gap-2 text-left px-4 py-4 text-[13px] font-bold border-l-4 ${
                  method === m.id
                    ? 'bg-mist border-myntra text-ink'
                    : 'border-transparent text-ink-soft hover:bg-mist/60'
                }`}
              >
                <m.icon size={16} />
                {m.label.split(' (')[0]}
              </button>
            ))}
          </div>
          <div className="p-6">
            {method === 'cod' && (
              <div>
                <h2 className="font-bold text-[16px]">Cash on Delivery</h2>
                <p className="text-sm text-ink-soft mt-2">
                  Pay with cash or UPI when your order arrives. Extra ₹0 convenience fee on this order.
                </p>
              </div>
            )}
            {method === 'upi' && (
              <div>
                <h2 className="font-bold text-[16px] mb-3">Pay using UPI</h2>
                <input
                  value={upi}
                  onChange={(e) => {
                    setUpi(e.target.value.replace(/\s/g, '').slice(0, 80));
                    setError('');
                  }}
                  placeholder="yourname@oksbi"
                  maxLength={80}
                  className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
                />
                <div className="flex gap-2 mt-3 text-[11px] font-bold text-ink-soft">
                  <span className="px-2 py-1 border border-line">PhonePe</span>
                  <span className="px-2 py-1 border border-line">GPay</span>
                  <span className="px-2 py-1 border border-line">Paytm</span>
                </div>
              </div>
            )}
            {method === 'card' && (
              <div className="space-y-3">
                <h2 className="font-bold text-[16px]">Credit / Debit Card</h2>
                <input
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                  placeholder="XXXX XXXX XXXX XXXX"
                  inputMode="numeric"
                  maxLength={19}
                  className="w-full border border-line px-3 py-2.5 text-sm outline-none"
                />
                <input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: onlyNameChars(e.target.value, 50) })}
                  placeholder="Name on card"
                  maxLength={50}
                  className="w-full border border-line px-3 py-2.5 text-sm outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    maxLength={5}
                    className="border border-line px-3 py-2.5 text-sm outline-none"
                  />
                  <input
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: onlyDigits(e.target.value, 4) })}
                    placeholder="CVV"
                    className="border border-line px-3 py-2.5 text-sm outline-none"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
                <p className="text-[11px] text-muted">Demo checkout — try 4111 1111 1111 1111. Cards are not charged.</p>
              </div>
            )}
            {method === 'netbanking' && (
              <div>
                <h2 className="font-bold text-[16px] mb-3">Net Banking</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Yes Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBank(b);
                        setError('');
                      }}
                      className={`border py-2 font-semibold hover:border-myntra ${
                        bank === b ? 'border-myntra text-myntra' : 'border-line'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {method === 'wallet' && (
              <div>
                <h2 className="font-bold text-[16px] mb-3">Wallets</h2>
                <div className="space-y-2 text-sm font-semibold">
                  {['Paytm', 'Amazon Pay', 'Mobikwik', 'PhonePe Wallet'].map((w) => (
                    <label key={w} className="flex items-center gap-2 border border-line p-3">
                      <input type="radio" name="wallet" defaultChecked={w === 'Paytm'} className="accent-myntra" />
                      {w}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-myntra font-semibold mt-4">{error}</p>}

            <button
              onClick={pay}
              disabled={busy}
              className="w-full mt-6 h-12 bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase"
            >
              {busy ? 'Placing order...' : method === 'cod' ? `Place Order · ${formatInr(total)}` : `Pay ${formatInr(total)}`}
            </button>
          </div>
        </div>
      </div>

      <aside className="h-fit space-y-4">
        <div className="bg-white border border-line p-4 text-[13px]">
          <p className="text-[12px] font-bold uppercase text-ink-soft mb-2">Deliver to</p>
          <p className="font-bold">
            {address.name} <span className="ml-2 text-[10px] border border-line px-1.5 py-0.5">{address.type}</span>
          </p>
          <p className="text-ink-soft mt-1">
            {address.address}, {address.locality}, {address.city}, {address.state} - {address.pincode}
          </p>
          <p className="mt-1">{address.mobile}</p>
        </div>
        <div className="bg-white border border-line p-4">
          <PriceDetails mrp={mrp} price={price} coupon={couponOff} />
        </div>
      </aside>
    </div>
  );
}
