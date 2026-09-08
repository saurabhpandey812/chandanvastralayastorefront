import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { STORE_LOGO, STORE_NAME, STORE_NAME_BOTTOM, STORE_NAME_TOP } from '@/lib/brand';

const sizes = { sm: 36, md: 40, lg: 48 };

export default function StoreMark({
  href = '/',
  size = 'md',
  showName = true,
  tone = 'dark',
}: {
  href?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  tone?: 'dark' | 'light';
}) {
  const px = sizes[size];
  const light = tone === 'light';

  const inner = (
    <>
      <span
        className="relative shrink-0 overflow-hidden rounded-[6px] bg-[#5c0a1a]"
        style={{ width: px, height: px }}
      >
        <Image src={STORE_LOGO} alt={STORE_NAME} fill sizes={`${px}px`} className="object-cover" priority />
      </span>
      {showName && (
        <span className="flex flex-col justify-center leading-none min-w-0">
          <span
            className={clsx(
              'font-extrabold tracking-tight',
              size === 'sm' ? 'text-[15px]' : size === 'lg' ? 'text-[20px]' : 'text-[18px]',
              light ? 'text-white' : 'text-[#282c3f]'
            )}
          >
            {STORE_NAME_TOP}
          </span>
          <span
            className={clsx(
              'uppercase font-semibold mt-[3px]',
              size === 'sm' ? 'text-[9px] tracking-[0.16em]' : 'text-[10px] tracking-[0.18em]',
              light ? 'text-white/75' : 'text-[#696b79]'
            )}
          >
            {STORE_NAME_BOTTOM}
          </span>
        </span>
      )}
    </>
  );

  if (!href) {
    return <span className="flex items-center gap-2.5 min-w-0">{inner}</span>;
  }

  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0 min-w-0">
      {inner}
    </Link>
  );
}
