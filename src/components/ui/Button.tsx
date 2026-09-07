import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'bag' | 'wish';
}

export default function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'primary' &&
          'bg-myntra text-white hover:bg-myntra-dark rounded-sm',
        variant === 'bag' &&
          'bg-myntra text-white hover:bg-myntra-dark rounded-sm',
        variant === 'wish' &&
          'border border-ink/20 bg-white text-ink hover:border-ink rounded-sm',
        variant === 'secondary' &&
          'border border-ink text-ink hover:border-myntra hover:text-myntra rounded-sm',
        variant === 'ghost' && 'text-ink-soft hover:text-myntra normal-case tracking-normal font-semibold',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
