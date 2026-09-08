'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PriceDetails from '@/components/checkout/PriceDetails';
import RequireAuth from '@/components/auth/RequireAuth';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';
import { Address } from '@/types/product';
import {
  addressLineError,
  cityError,
  localityError,
  mobileError,
  onlyCityChars,
  onlyDigits,
  onlyNameChars,
  personNameError,
  pincodeError,
} from '@/lib/validation';

const empty: Address = {
  name: '',
  mobile: '',
  pincode: '',
  address: '',
  locality: '',
  city: '',
  state: 'Maharashtra',
  type: 'Home',
};

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const mrp = useCartStore((s) => s.totalMrp());
  const price = useCartStore((s) => s.totalPrice());
  const couponOff = useCartStore((s) => s.couponDiscount());
  const saved = useOrderStore((s) => s.address);
  const saveAddress = useOrderStore((s) => s.saveAddress);
  const user = useAuthStore((s) => s.user);
  const hydrated = useHydrated((s) => s.hydrated);
  const [form, setForm] = useState<Address>(saved ?? empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace('/cart');
  }, [hydrated, items.length, router]);

  useEffect(() => {
    if (saved) {
      setForm(saved);
    } else if (user) {
      setForm((f) => ({ ...f, name: user.name, mobile: user.mobile }));
    }
  }, [saved, user]);

  if (!hydrated) return <div className="p-10 text-muted">Loading...</div>;

  if (items.length === 0) {
    return <div className="p-10 text-muted">Redirecting to bag...</div>;
  }

  function validateAll() {
    const next: Partial<Record<keyof Address, string>> = {};
    const nameErr = personNameError(form.name);
    const phoneErr = mobileError(form.mobile);
    const pinErr = pincodeError(form.pincode);
    const addrErr = addressLineError(form.address);
    const locErr = localityError(form.locality);
    const cityErr = cityError(form.city);
    if (nameErr) next.name = nameErr;
    if (phoneErr) next.mobile = phoneErr;
    if (pinErr) next.pincode = pinErr;
    if (addrErr) next.address = addrErr;
    if (locErr) next.locality = locErr;
    if (cityErr) next.city = cityErr;
    if (!form.state) next.state = 'Select your state';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;
    saveAddress({
      ...form,
      name: form.name.trim(),
      mobile: onlyDigits(form.mobile, 10),
      pincode: onlyDigits(form.pincode, 6),
      address: form.address.trim(),
      locality: form.locality.trim(),
      city: form.city.trim(),
    });
    router.push('/payment');
  }

  const sanitizers: Partial<Record<keyof Address, (v: string) => string>> = {
    name: onlyNameChars,
    mobile: (v) => onlyDigits(v, 10),
    pincode: (v) => onlyDigits(v, 6),
    city: onlyCityChars,
    locality: (v) => v.replace(/[<>]/g, '').slice(0, 40),
    address: (v) => v.replace(/[<>]/g, '').slice(0, 120),
  };

  const field = (
    key: keyof Address,
    label: string,
    extra?: string,
    inputMode?: 'numeric' | 'text'
  ) => (
    <label className="block">
      <span className="text-[12px] font-bold text-ink-soft">{label}</span>
      <input
        value={form[key] as string}
        inputMode={inputMode}
        maxLength={key === 'mobile' ? 10 : key === 'pincode' ? 6 : key === 'name' ? 50 : 120}
        onChange={(e) => {
          const value = sanitizers[key] ? sanitizers[key]!(e.target.value) : e.target.value;
          setForm({ ...form, [key]: value });
          if (errors[key]) setErrors({ ...errors, [key]: undefined });
        }}
        className={`mt-1 w-full border px-3 py-2.5 text-sm outline-none focus:border-ink ${
          errors[key] ? 'border-myntra' : 'border-line'
        }`}
        placeholder={extra}
      />
      {errors[key] && <span className="text-[12px] text-myntra font-semibold mt-1 block">{errors[key]}</span>}
    </label>
  );

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
      <form onSubmit={onSubmit} noValidate className="bg-white border border-line p-5 space-y-4">
        <h1 className="text-[16px] font-bold">Contact Details</h1>
        {field('name', 'Name*')}
        {field('mobile', 'Mobile No*', '10-digit mobile', 'numeric')}
        <h2 className="text-[16px] font-bold pt-2">Address</h2>
        {field('pincode', 'Pin Code*', '6-digit pincode', 'numeric')}
        {field('address', 'Address (House No, Building, Street, Area)*')}
        {field('locality', 'Locality / Town')}
        <div className="grid grid-cols-2 gap-3">
          {field('city', 'City / District*')}
          <label className="block">
            <span className="text-[12px] font-bold text-ink-soft">State*</span>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none"
            >
              {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Rajasthan'].map(
                (s) => (
                  <option key={s}>{s}</option>
                )
              )}
            </select>
          </label>
        </div>
        <div>
          <p className="text-[12px] font-bold text-ink-soft mb-2">Save address as</p>
          <div className="flex gap-2">
            {(['Home', 'Work'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`px-4 py-1.5 rounded-full border text-xs font-bold ${
                  form.type === t ? 'border-myntra text-myntra' : 'border-line'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full h-12 bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase"
        >
          Add Address & Continue
        </button>
      </form>

      <aside className="h-fit bg-white border border-line p-4">
        <p className="text-[12px] font-bold mb-3">{items.length} ITEMS</p>
        <PriceDetails mrp={mrp} price={price} coupon={couponOff} />
      </aside>
    </div>
  );
}
