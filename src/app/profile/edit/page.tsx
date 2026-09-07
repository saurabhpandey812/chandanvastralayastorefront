'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Smartphone, User } from 'lucide-react';
import PasswordField from '@/components/auth/PasswordField';
import ProfileGuest from '@/components/profile/ProfileGuest';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';
import { AuthUser } from '@/types/auth';
import {
  emailError,
  mobileError,
  onlyDigits,
  onlyNameChars,
  passwordError,
  personNameError,
} from '@/lib/validation';

const genders: NonNullable<AuthUser['gender']>[] = ['Male', 'Female', 'Other'];

export default function EditProfilePage() {
  const router = useRouter();
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<AuthUser['gender']>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setMobile(user.mobile);
    setGender(user.gender);
  }, [user]);

  const dirty = useMemo(() => {
    if (!user) return false;
    return (
      name !== user.name ||
      email !== user.email ||
      mobile !== user.mobile ||
      gender !== user.gender ||
      Boolean(newPassword)
    );
  }, [user, name, email, mobile, gender, newPassword]);

  if (!hydrated) {
    return <div className="p-10 text-center text-muted">Loading profile...</div>;
  }

  if (!user) return <ProfileGuest next="/profile/edit" />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const nextErrors: Record<string, string> = {};
    const nameErr = personNameError(name);
    const mailErr = emailError(email);
    const phoneErr = mobileError(mobile);
    if (nameErr) nextErrors.name = nameErr;
    if (mailErr) nextErrors.email = mailErr;
    if (phoneErr) nextErrors.mobile = phoneErr;
    if (newPassword || currentPassword || confirmPassword) {
      const currentErr = passwordError(currentPassword);
      const newErr = passwordError(newPassword, { requiredStrong: true });
      if (currentErr) nextErrors.currentPassword = currentErr;
      if (newErr) nextErrors.newPassword = newErr;
      if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'New passwords do not match';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    const result = updateProfile({
      name,
      email,
      mobile,
      gender,
      currentPassword: newPassword ? currentPassword : undefined,
      newPassword: newPassword || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push('/profile');
  }

  return (
    <div className="bg-mist min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white border border-line p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-myntra text-white flex items-center justify-center font-black text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-lg truncate">{user.name}</p>
            <p className="text-sm text-muted truncate">{user.email}</p>
            <p className="text-[12px] text-ink-soft mt-0.5">+91 {user.mobile}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="bg-white border border-line mt-4 p-5 space-y-4">
          <div>
            <h2 className="text-[16px] font-black">Edit profile</h2>
            <p className="text-[12px] text-muted mt-1">Update your account details used for orders and checkout.</p>
          </div>

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
                maxLength={50}
                className="w-full h-12 rounded-md border border-line pl-11 pr-3 text-sm outline-none focus:border-myntra"
              />
            </div>
            {errors.name && <p className="text-[12px] text-myntra font-semibold mt-1">{errors.name}</p>}
          </label>

          <div>
            <span className="text-[12px] font-bold text-ink-soft">Gender</span>
            <div className="flex gap-2 mt-2">
              {genders.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`h-9 px-4 rounded-full border text-[12px] font-bold ${
                    gender === g ? 'border-myntra text-myntra' : 'border-line text-ink-soft'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

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
                maxLength={80}
                className="w-full h-12 rounded-md border border-line pl-11 pr-3 text-sm outline-none focus:border-myntra"
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
                inputMode="numeric"
                maxLength={10}
                className="w-full h-12 rounded-md border border-line pl-11 pr-3 text-sm outline-none focus:border-myntra"
              />
            </div>
            {errors.mobile && <p className="text-[12px] text-myntra font-semibold mt-1">{errors.mobile}</p>}
          </label>

          <div className="pt-3 border-t border-line">
            <h3 className="text-[14px] font-black">Change password</h3>
            <p className="text-[12px] text-muted mt-1">Leave blank if you do not want to change it.</p>
            <div className="mt-3 space-y-3">
              <PasswordField
                value={currentPassword}
                onChange={(v) => {
                  setCurrentPassword(v);
                  setErrors((prev) => ({ ...prev, currentPassword: '' }));
                }}
                placeholder="Current password"
                autoComplete="current-password"
                name="current-password"
              />
              {errors.currentPassword && (
                <p className="text-[12px] text-myntra font-semibold">{errors.currentPassword}</p>
              )}
              <PasswordField
                value={newPassword}
                onChange={(v) => {
                  setNewPassword(v);
                  setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                placeholder="New password"
                autoComplete="new-password"
                name="new-password"
              />
              {errors.newPassword && (
                <p className="text-[12px] text-myntra font-semibold">{errors.newPassword}</p>
              )}
              <PasswordField
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                name="confirm-new-password"
              />
              {errors.confirmPassword && (
                <p className="text-[12px] text-myntra font-semibold">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-myntra">{error}</p>}

          <button
            type="submit"
            disabled={busy || !dirty}
            className="w-full h-12 bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save profile'}
          </button>
          <Link
            href="/profile"
            className="inline-flex w-full h-12 items-center justify-center border border-line text-sm font-bold uppercase"
          >
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}
