import Image from 'next/image';
import Link from 'next/link';

export const STORE_NAME = 'Chandan Vastralaya';

type BrandLogoProps = {
  href?: string | false;
  variant?: 'light' | 'dark';
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  hideNameOnMobile?: boolean;
};

const sizes = { sm: 32, md: 36, lg: 40 };

export default function BrandLogo({
  href = '/',
  variant = 'dark',
  subtitle,
  size = 'md',
  hideNameOnMobile = false,
}: BrandLogoProps) {
  const px = sizes[size];
  const nameColor = variant === 'light' ? 'text-white' : 'text-ink';
  const subColor = variant === 'light' ? 'text-white/65' : 'text-muted';
  const titleSize =
    size === 'sm' ? 'text-[14px]' : size === 'lg' ? 'text-xl' : 'text-[15px] sm:text-[16px]';

  const inner = (
    <>
      <Image
        src="/logo.png"
        alt={STORE_NAME}
        width={px}
        height={px}
        className="rounded-md shrink-0 object-cover"
        priority
      />
      <span className={`leading-[1.05] ${hideNameOnMobile ? 'hidden sm:block' : 'block'} ${nameColor}`}>
        <span className={`block font-extrabold tracking-tight ${titleSize}`}>Chandan</span>
        <span className={`block font-semibold uppercase tracking-[0.14em] text-[9px] sm:text-[10px] ${subColor}`}>
          Vastralaya
        </span>
        {subtitle ? (
          <span className={`block font-semibold uppercase tracking-[0.18em] mt-0.5 text-[10px] ${subColor}`}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </>
  );

  const className = 'flex items-center gap-2 shrink-0';
  if (href === false) return <div className={className}>{inner}</div>;
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
