'use client';

import {
  useCallback,
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/common/utils/cn';

type TooltipProps = PropsWithChildren<{
  content: ReactNode;
  className?: string;
  placement?: 'top' | 'bottom';
}>;

const VIEWPORT_MARGIN = 12;
const TOOLTIP_OFFSET = 10;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function Tooltip({
  content,
  className,
  placement = 'top',
  children,
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const mounted = typeof window !== 'undefined';

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current?.getBoundingClientRect();
    const tooltip = tooltipRef.current?.getBoundingClientRect();

    if (!trigger || !tooltip) return;

    const centerX = trigger.left + trigger.width / 2;
    const minX = VIEWPORT_MARGIN + tooltip.width / 2;
    const maxX = window.innerWidth - VIEWPORT_MARGIN - tooltip.width / 2;
    const left = clamp(centerX, minX, maxX);
    const top =
      placement === 'bottom'
        ? trigger.bottom + TOOLTIP_OFFSET
        : trigger.top - TOOLTIP_OFFSET;

    setStyle({
      left,
      top,
      transform: placement === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [content, open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, updatePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('inline-flex align-middle', className)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>

      {mounted && open && content
        ? createPortal(
            <div
              ref={tooltipRef}
              role='tooltip'
              className='fixed z-[90] max-w-[220px] rounded-xl border border-slate-700/80 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium leading-tight text-slate-50 shadow-[0_18px_36px_-20px_rgba(15,23,42,0.75)] pointer-events-none'
              style={style}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
