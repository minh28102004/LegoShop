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
  placement?: 'top' | 'bottom' | 'left' | 'right';
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
    const centerY = trigger.top + trigger.height / 2;
    const minX = VIEWPORT_MARGIN + tooltip.width / 2;
    const maxX = window.innerWidth - VIEWPORT_MARGIN - tooltip.width / 2;
    const minY = VIEWPORT_MARGIN + tooltip.height / 2;
    const maxY = window.innerHeight - VIEWPORT_MARGIN - tooltip.height / 2;

    if (placement === 'left' || placement === 'right') {
      setStyle({
        left: placement === 'right' ? trigger.right + TOOLTIP_OFFSET : trigger.left - TOOLTIP_OFFSET,
        top: clamp(centerY, minY, maxY),
        transform: placement === 'right' ? 'translate(0, -50%)' : 'translate(-100%, -50%)',
      });
      return;
    }

    const left = clamp(centerX, minX, maxX);
    const top = placement === 'bottom' ? trigger.bottom + TOOLTIP_OFFSET : trigger.top - TOOLTIP_OFFSET;

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
              className='pointer-events-none fixed z-[90] max-w-[220px] rounded-lg bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-white shadow-[0_18px_36px_-20px_rgba(15,23,42,0.65)]'
              style={style}
            >
              <span
                aria-hidden='true'
                className={cn(
                  'absolute h-2 w-2 rotate-45 bg-slate-700',
                  placement === 'bottom' && 'left-1/2 -top-1 -translate-x-1/2',
                  placement === 'top' && 'left-1/2 -bottom-1 -translate-x-1/2',
                  placement === 'right' && '-left-1 top-1/2 -translate-y-1/2',
                  placement === 'left' && '-right-1 top-1/2 -translate-y-1/2',
                )}
              />
              <span className='relative z-10'>{content}</span>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
