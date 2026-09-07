'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Mail, ShieldCheck } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import PasswordField from '@/components/auth/PasswordField';
import SocialButtons from '@/components/auth/SocialButtons';
import { loginIdError, passwordError } from '@/lib/authValidation';
import { safeNext, useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, next, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfo('');
    const value = id.trim();
    const idErr = loginIdError(value);
    const passErr = passwordError(password);
    if (idErr) {
      setError(idErr);
      return;
    }
    if (passErr) {
      setError(passErr);
      return;
    }
    setBusy(true);
    if (!hydrated) {
      setError('Please wait a moment and try again');
      setBusy(false);
      return;
    }
    const result = login(value, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next);
  }

  return (
    <AuthShell
      kicker="Members only checkout"
      title="Login to place your order."
      subtitle="Track orders, save addresses and check out faster — the way premium fashion stores do it."
    >
      <div className="bg-white border border-line shadow-card rounded-xl p-6 sm:p-8">
        <p className="text-[11px] font-bold tracking-[3px] uppercase text-myntra">Welcome back</p>
        <h2 className="mt-2 text-2xl font-black text-ink">Login to Aaraish</h2>
        <p className="mt-1 text-sm text-muted">
          {next === '/checkout' || next === '/payment'
            ? 'Sign in to continue to checkout.'
            : 'Use your email or mobile number.'}
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[12px] font-bold text-ink-soft">Email or mobile</span>
            <div className="relative mt-1.5">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={id}
                onChange={(e) => setId(e.target.value.slice(0, 80))}
                autoComplete="username"
                maxLength={80}
                placeholder="name@email.com or 9876543210"
                className="w-full h-12 rounded-md border border-line pl-11 pr-3 text-sm outline-none transition focus:border-myntra focus:ring-2 focus:ring-myntra/15"
              />
            </div>
          </label>

          <PasswordField value={password} onChange={setPassword} />

          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2 text-ink-soft font-semibold">
              <input type="checkbox" className="accent-myntra" defaultChecked />
              Keep me signed in
            </label>
            <button
              type="button"
              onClick={() =>
                setInfo('Password reset is demo-only. Use  saurabh@aaraish.com  /  Aaraish@123')
              }
              className="font-bold text-myntra"
            >
              Forgot password?
            </button>
          </div>

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
            {busy ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <SocialButtons
          onDemo={(provider) =>
            setInfo(`${provider} login is coming soon. This demo uses email — try the sample account below.`)
          }
        />

        <div className="mt-5 rounded-md bg-[#fff4f7] border border-myntra/20 p-3 text-[12px] text-ink-soft">
          <p className="font-bold text-ink">Demo account</p>
          <p className="mt-0.5">saurabh@aaraish.com · Aaraish@123</p>
        </div>

        <p className="mt-5 text-sm text-center text-ink-soft">
          New to Aaraish?{' '}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold text-myntra">
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-[11px] text-muted text-center flex items-center justify-center gap-1">
          <ShieldCheck size={12} /> By continuing, you agree to Aaraish Terms &amp; Privacy Policy.
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
