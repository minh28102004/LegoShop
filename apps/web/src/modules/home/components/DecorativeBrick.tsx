import { cn } from '@lego-shop/ui'

type DecorativeBrickProps = {
  className?: string
  tone?: 'blue' | 'gold' | 'navy' | 'white'
  size?: 'sm' | 'md' | 'lg'
  studs?: 2 | 3 | 4
}

const TONE_CLASSES = {
  blue: 'border-primary/20 bg-primary-light text-primary/30',
  gold: 'border-accent-dark/20 bg-accent-soft text-accent-dark/25',
  navy: 'border-white/10 bg-navy text-white/15',
  white: 'border-white/60 bg-white/85 text-primary/15',
} as const

const SIZE_CLASSES = {
  sm: 'gap-1 rounded-[7px] p-1.5 [&>i]:h-2 [&>i]:w-2',
  md: 'gap-1.5 rounded-[9px] p-2 [&>i]:h-2.5 [&>i]:w-2.5',
  lg: 'gap-2 rounded-[11px] p-2.5 [&>i]:h-3 [&>i]:w-3',
} as const

export function DecorativeBrick({
  className,
  size = 'md',
  studs = 3,
  tone = 'blue',
}: DecorativeBrickProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none inline-grid w-fit grid-flow-col border shadow-[inset_0_-3px_0_rgba(15,35,63,0.06),0_10px_22px_-18px_rgba(15,35,63,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {Array.from({ length: studs }).map((_, index) => (
        <i
          key={index}
          className="block rounded-full bg-current shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
        />
      ))}
    </span>
  )
}
