'use client'

import { useState } from 'react'

import { cn } from '../cn'
import { Dropdown } from './Dropdown'

export type LanguageSwitcherOption<TValue extends string = string> = {
  value: TValue
  label: string
  flagSrc: string
  flagAlt: string
}

export type LanguageSwitcherProps<TValue extends string = string> = {
  className?: string | undefined
  compact?: boolean | undefined
  label: string
  options: Array<LanguageSwitcherOption<TValue>>
  value: TValue
  onChange: (nextValue: TValue, label: string) => void
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LanguageSwitcher<TValue extends string = string>({
  className,
  compact = false,
  label,
  onChange,
  options,
  value,
}: LanguageSwitcherProps<TValue>) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value) ?? options[0]

  if (!selected) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs font-medium text-slate-500',
        compact && 'gap-0 xl:gap-2',
        className,
      )}
    >
      <span className={compact ? 'hidden xl:inline' : ''}>{label}</span>

      <Dropdown
        align="right"
        portal
        matchTriggerWidth
        offset={6}
        panelRole="listbox"
        onOpenChange={setOpen}
        className={cn('w-[116px] min-w-[116px]', compact && 'w-[112px] min-w-[112px]')}
        panelClassName="p-1.5"
        trigger={
          <button
            type="button"
            className="group relative inline-flex h-10 min-h-10 items-center gap-2 overflow-hidden rounded-[14px] bg-white px-3 text-left text-[13px] font-semibold text-slate-700 shadow-[0_8px_22px_-18px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]"
            aria-label={label}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-slate-200/90 transition group-hover:ring-[var(--admin-primary-tint)]"
            />
            <img
              src={selected.flagSrc}
              alt={selected.flagAlt}
              width={20}
              height={20}
              className="relative h-5 w-5 shrink-0 rounded-full object-cover"
            />
            <span className="relative min-w-0 flex-1 truncate">{selected.label}</span>
            <span
              className={cn(
                'relative shrink-0 text-slate-400 transition-transform duration-150 group-hover:text-slate-600',
                open && 'rotate-180 text-[var(--admin-primary-strong)]',
              )}
            >
              <ChevronDownIcon />
            </span>
          </button>
        }
      >
        {({ close }) => (
          <div className="space-y-1">
            {options.map((option) => {
              const active = option.value === value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    'flex min-h-10 w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-semibold transition-colors duration-150',
                    active
                      ? 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)]'
                      : 'text-slate-700 hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]',
                  )}
                  onClick={() => {
                    close()

                    if (option.value === value) return

                    onChange(option.value, option.label)
                  }}
                >
                  <img
                    src={option.flagSrc}
                    alt={option.flagAlt}
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </Dropdown>
    </div>
  )
}
