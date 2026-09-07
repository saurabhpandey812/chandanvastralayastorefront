'use client';

import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

export default function PasswordField({
  value,
  onChange,
  placeholder = 'Password',
  autoComplete = 'current-password',
  name = 'password',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className="block">
      <span className="text-[12px] font-bold text-ink-soft">{placeholder}</span>
      <div className="relative mt-1.5">
        <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 64))}
          autoComplete={autoComplete}
          maxLength={64}
          className="w-full h-12 rounded-md border border-line bg-white pl-11 pr-11 text-sm outline-none transition focus:border-myntra focus:ring-2 focus:ring-myntra/15"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
