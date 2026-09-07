'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    href: '/products/women',
    kicker: 'END OF SEASON SALE',
    title: 'FLAT 50–80% OFF',
    subtitle: 'Western wear, ethnic sets & more',
    cta: 'Shop Women',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80',
    tint: 'from-[#2b0a16]/80 via-[#2b0a16]/35 to-transparent',
  },
  {
    href: '/products/men',
    kicker: 'MEN’S FESTIVE EDIT',
    title: 'SHIRTS, JACKETS, KURTAS',
    subtitle: 'Starting ₹899 · Extra 10% with FESTIVE500',
    cta: 'Shop Men',
    image:
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1800&q=80',
    tint: 'from-[#0c1a2b]/80 via-[#0c1a2b]/35 to-transparent',
  },
  {
    href: '/products/ethnic',
    kicker: 'WEDDING SEASON',
    title: 'KURTA SETS & SAREES',
    subtitle: 'Biba · Libas · Kalini · Manyavar',
    cta: 'Shop Ethnic',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80',
    tint: 'from-[#3b1020]/80 via-[#3b1020]/30 to-transparent',
  },
  {
    href: '/products/kids',
    kicker: 'KIDS WEAR',
    title: 'PLAY-READY DROPS',
    subtitle: 'Tees, jeans, hoodies from ₹399',
    cta: 'Shop Kids',
    image:
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1800&q=80',
    tint: 'from-[#12201a]/80 via-[#12201a]/30 to-transparent',
  },
];

export default function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative bg-white">
      <div className="relative h-[280px] sm:h-[380px] lg:h-[460px] overflow-hidden">
        <Image
          key={slide.image}
          src={slide.image}
          alt={slide.title}
          fill
          priority
          className="object-cover banner-fade"
          sizes="100vw"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.tint}`} />
        <div className="relative h-full max-w-store mx-auto px-6 flex items-center">
          <div className="max-w-xl text-white">
            <p className="text-[11px] sm:text-xs font-bold tracking-[4px] uppercase text-gold">
              {slide.kicker}
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl lg:text-[56px] font-black leading-[1.05] tracking-tight">
              {slide.title}
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-white/85">{slide.subtitle}</p>
            <Link
              href={slide.href}
              className="inline-flex mt-6 px-7 py-3 bg-myntra hover:bg-myntra-dark text-white text-sm font-bold uppercase tracking-wider rounded-sm"
            >
              {slide.cta}
            </Link>
          </div>
        </div>

        <button
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-ink flex items-center justify-center shadow-card"
          aria-label="Previous banner"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-ink flex items-center justify-center shadow-card"
          aria-label="Next banner"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center gap-2 py-3 bg-white">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-myntra' : 'w-1.5 bg-line'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
