'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Mail, Smartphone, User } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import PasswordField from '@/components/auth/PasswordField';
import SocialButtons from '@/components/auth/SocialButtons';
import {
  emailError,
  mobileError,
  passwordError,
  passwordHint,
  passwordScore,
  personNameError,
} from '@/lib/authValidation';
import { onlyDigits, onlyNameChars } from '@/lib/validation';
import { safeNext, useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';

const scoreLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const scoreColor = ['bg-line', 'bg-myntra', 'bg-orange', 'bg-gold', 'bg-forest'];

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const signup = useAuthStore((s) => s.signup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const score = useMemo(() => passwordScore(password), [password]);

  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, next, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfo('');
    const nextErrors: Record<string, string> = {};
    const nameErr = personNameError(name);
    const mailErr = emailError(email);
    const phoneErr = mobileError(mobile);
    const passErr = passwordError(password, { requiredStrong: true });
    if (nameErr) nextErrors.name = nameErr;
    if (mailErr) nextErrors.email = mailErr;
    if (phoneErr) nextErrors.mobile = phoneErr;
    if (passErr) nextErrors.password = passErr;
    if (password !== confirm) nextErrors.confirm = 'Passwords do not match';
    if (!agree) nextErrors.agree = 'Please accept the Terms to create your account';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setError('');
    setBusy(true);
    if (!hydrated) {
      setError('Please wait a moment and try again');
      setBusy(false);
      return;
    }
    const result = signup({ name: name.trim(), email: email.trim(), mobile, password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next);
  }

  return (
    <AuthShell
      kicker="Join Chandan Vastralaya"
      title="Create your fashion account."
      subtitle="One account for wishlist, bag, saved addresses and order tracking."
    >
      <div className="bg-white border border-line shadow-card rounded-xl p-6 sm:p-8">
        <p className="text-[11px] font-bold tracking-[3px] uppercase text-myntra">New here</p>
        <h2 className="mt-2 text-2xl font-black text-ink">Create an account</h2>
        <p className="mt-1 text-sm text-muted">Takes under a minute. Login is required before placing an order.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[12px] font-bold text-ink-soft">Full name</span>
            <div className="relative mt-1.5">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={name}
                onChange={(e) => {
                  setName(onlyNameChars(e.target.value));
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                autoComplete="name"
                maxLength={50}
                placeholder="As on delivery address"
                className="w-full h-12 rounded-md border border-line pl-11 pr-3 text-sm outline-none transition focus:border-myntra focus:ring-2 focus:ring-myntra/15"
              />
            </div>
            {errors.name && <p className="text-[12px] text-myntra font-semibold mt-1">{errors.name}</p>}
          </label>

          <label className="block">
            <span className="text-[12px] font-bold text-ink-soft">Email</span>
            <div className="relative mt-1.5">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.slice(0, 80));
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
                autoComplete="email"
                maxLength={80}
                placeholder="you@email.com"
                className="w-full h-12 rounded-md border border-line pl-11 pr-3 text-sm outline-none transition focus:border-myntra focus:ring-2 focus:ring-myntra/15"
              />
            </div>
            {errors.email && <p className="text-[12px] text-myntra font-semibold mt-1">{errors.email}</p>}
          </label>

          <label className="block">
            <span className="text-[12px] font-bold text-ink-soft">Mobile number</span>
            <div className="relative mt-1.5">
              <Smartphone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={mobile}
                onChange={(e) => {
                  setMobile(onlyDigits(e.target.value, 10));
                  setErrors((prev) => ({ ...prev, mobile: '' }));
                }}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                className="w-full h-12 rounded-md border border-line pl-11 pr-3 text-sm outline-none transition focus:border-myntra focus:ring-2 focus:ring-myntra/15"
              />
            </div>
            {errors.mobile && <p className="text-[12px] text-myntra font-semibold mt-1">{errors.mobile}</p>}
          </label>

          <div>
            <PasswordField
              value={password}
              onChange={(v) => {
                setPassword(v);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Create password"
              autoComplete="new-password"
              name="new-password"
            />
            {errors.password && (
              <p className="text-[12px] text-myntra font-semibold mt-1">{errors.password}</p>
            )}
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full ${i < score ? scoreColor[score] : 'bg-line'}`}
                />
              ))}
            </div>
            {password && (
              <p className="mt-1.5 text-[11px] font-semibold text-ink-soft">
                {scoreLabel[score]} · {passwordHint(password)}
              </p>
            )}
          </div>

          <PasswordField
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              setErrors((prev) => ({ ...prev, confirm: '' }));
            }}
            placeholder="Confirm password"
            autoComplete="new-password"
            name="confirm-password"
          />
          {errors.confirm && (
            <p className="text-[12px] text-myntra font-semibold mt-1">{errors.confirm}</p>
          )}

          <label className="flex items-start gap-2 text-[12px] text-ink-soft">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                setErrors((prev) => ({ ...prev, agree: '' }));
              }}
              className="mt-0.5 accent-myntra"
            />
            <span>
              I agree to the Chandan Vastralaya Terms of Use and Privacy Policy, and I want order updates on email
              &amp; WhatsApp.
            </span>
          </label>
          {errors.agree && <p className="text-[12px] text-myntra font-semibold">{errors.agree}</p>}

          {error && (
            <p className="flex items-start gap-2 text-sm font-semibold text-myntra">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
          {info && <p className="text-[12px] text-ink-soft bg-mist rounded-md p-3">{info}</p>}

          <button
            type="submit"
            disabled={busy || !hydrated}
            className="w-full h-12 rounded-md bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase tracking-wide disabled:opacity-60"
          >
            {busy ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <SocialButtons
          onDemo={(provider) =>
            setInfo(`${provider} signup is coming soon. Create an account with email for this demo.`)
          }
        />

        <p className="mt-5 text-sm text-center text-ink-soft">
          Already have an account?{' '}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-myntra">
            Login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
