'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BarChart3, Boxes, CircleDollarSign, Layers3 } from 'lucide-react';
import { cn } from '@/common/utils/cn';

const BANNERS = [
  {
    eyebrow: 'Catalog intelligence',
    headline: 'Cleaner catalog control.',
    metric: '+34%',
    metricLabel: 'faster catalog updates',
    accent: '#4DA3FF',
    icon: Boxes,
  },
  {
    eyebrow: 'Order operations',
    headline: 'Track every order flow.',
    metric: '128',
    metricLabel: 'orders in motion',
    accent: '#F5C542',
    icon: Layers3,
  },
  {
    eyebrow: 'Revenue clarity',
    headline: 'See daily revenue faster.',
    metric: '2.4x',
    metricLabel: 'clearer revenue reads',
    accent: '#E94B5A',
    icon: CircleDollarSign,
  },
];

function ProductMock({ accent }: { accent: string }) {
  return (
    <div className='relative h-full min-h-[148px] overflow-hidden rounded-[18px] border border-white/64 bg-white/38 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]'>
      <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.12)_56%,rgba(255,255,255,0.5))]' />
      <div className='absolute left-4 top-4 grid grid-cols-3 gap-2'>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <span
            key={item}
            className='h-6 w-6 rounded-md border border-white/70 bg-white/62 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.5)]'
            style={{
              background:
                item % 3 === 0
                  ? accent
                  : item % 3 === 1
                    ? '#FFFFFF'
                    : '#B9DFF7',
            }}
          />
        ))}
      </div>
      <div className='absolute bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/72 p-3 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.54)] backdrop-blur-xl'>
        <div className='flex items-center justify-between gap-4'>
          <div className='space-y-2'>
            <div className='h-2 w-24 rounded-full bg-slate-900/12' />
            <div className='h-2 w-16 rounded-full bg-slate-900/10' />
          </div>
          <div className='grid h-10 w-10 place-items-center rounded-2xl' style={{ backgroundColor: accent }}>
            <BarChart3 className='h-4 w-4 text-white' aria-hidden='true' />
          </div>
        </div>
      </div>
      <div
        className='absolute right-5 top-5 h-16 w-16 rotate-3 rounded-2xl border border-white/68 bg-white/50 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.54)]'
      >
        <div className='grid h-full grid-cols-2 gap-1.5 p-2.5'>
          <span className='rounded-md bg-[#E94B5A]' />
          <span className='rounded-md bg-[#4DA3FF]' />
          <span className='rounded-md bg-[#F5C542]' />
          <span className='rounded-md bg-white' />
        </div>
      </div>
    </div>
  );
}

export default function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % BANNERS.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  function goTo(nextIndex: number) {
    setActiveIndex((nextIndex + BANNERS.length) % BANNERS.length);
  }

  function handlePointerEnd(clientX: number) {
    if (pointerStartX.current === null) return;

    const distance = clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(distance) < 36) return;
    goTo(activeIndex + (distance < 0 ? 1 : -1));
  }

  return (
    <div
      className='relative max-w-[500px] overflow-hidden rounded-[22px] border border-white/68 bg-white/38 p-3 shadow-[0_24px_64px_-50px_rgba(15,23,42,0.5)] backdrop-blur-xl'
      onPointerDown={(event) => {
        pointerStartX.current = event.clientX;
      }}
      onPointerCancel={() => {
        pointerStartX.current = null;
      }}
      onPointerUp={(event) => handlePointerEnd(event.clientX)}
    >
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(77,163,255,0.16),rgba(255,255,255,0)_48%,rgba(245,197,66,0.18))]' />

      <div className='relative min-h-[348px] sm:min-h-[236px]'>
        {BANNERS.map((banner, index) => {
          const active = index === activeIndex;
          const Icon = banner.icon;

          return (
            <article
              key={banner.headline}
              className={cn(
                'absolute inset-0 grid gap-3 rounded-[20px] transition-opacity duration-300 ease-out sm:grid-cols-[minmax(0,0.9fr)_minmax(190px,1.1fr)]',
                active
                  ? 'pointer-events-auto opacity-100'
                  : 'pointer-events-none opacity-0',
              )}
              aria-hidden={!active}
            >
              <div className='flex min-h-[188px] flex-col justify-between rounded-[18px] border border-white/66 bg-white/56 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-xl'>
                <div>
                  <div className='mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-[0_14px_28px_-20px_rgba(15,23,42,0.62)]' style={{ backgroundColor: banner.accent }}>
                    <Icon className='h-4 w-4' aria-hidden='true' />
                  </div>
                  <p className='text-xs font-bold uppercase text-slate-500'>{banner.eyebrow}</p>
                  <h2 className='mt-2 text-[21px] font-semibold leading-[1.12] tracking-normal text-[#0F172A]'>
                    {banner.headline}
                  </h2>
                </div>
                <div className='mt-4 flex items-end justify-between gap-3'>
                  <div>
                    <p className='text-[28px] font-bold leading-none text-[#0F172A]'>{banner.metric}</p>
                    <p className='mt-1 text-xs font-semibold text-slate-500'>{banner.metricLabel}</p>
                  </div>
                  <span className='grid h-9 w-9 place-items-center rounded-full border border-white/74 bg-white/72 text-slate-700 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.55)]'>
                    <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                  </span>
                </div>
              </div>

              <ProductMock accent={banner.accent} />
            </article>
          );
        })}
      </div>

      <div className='relative mt-3 flex justify-center gap-2'>
        {BANNERS.map((banner, index) => (
          <button
            key={banner.eyebrow}
            type='button'
            aria-label={`Show banner ${index + 1}`}
            aria-current={index === activeIndex}
            onClick={() => goTo(index)}
            className={cn(
              'h-2.5 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(77,163,255,0.14)]',
              index === activeIndex ? 'w-8 bg-[#4DA3FF]' : 'w-2.5 bg-slate-300/80 hover:bg-slate-400',
            )}
          />
        ))}
      </div>
    </div>
  );
}
