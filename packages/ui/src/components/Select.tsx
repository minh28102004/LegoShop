'use client'

import {
  Children,
  isValidElement,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '../cn'
import { Dropdown } from './Dropdown'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> {
  invalid?: boolean
  options?: SelectOption[]
  children?: ReactNode
  placeholder?: string
  label?: string
  error?: string
  hint?: string
  fieldState?: 'default' | 'error'
  onValueChange?: (value: string) => void
}

function parseOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string; children?: ReactNode }>(child)) return []
    if (child.type === 'option') {
      const option = child as ReactElement<{ value?: string; children?: ReactNode }>
      return [
        {
          value: option.props.value ?? '',
          label: String(option.props.children ?? ''),
        },
      ]
    }
    return []
  })
}

export const Select = ({
  children,
  className,
  disabled,
  error,
  fieldState,
  hint,
  id,
  invalid = false,
  label,
  onChange,
  onValueChange,
  options,
  placeholder,
  required,
  value,
  ...props
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const generatedListboxId = useId()
  const items = useMemo(() => {
    if (options && options.length > 0) return options
    return parseOptions(children)
  }, [children, options])

  const currentValue = String(value ?? '')
  const selected = items.find((item) => item.value === currentValue)
  const display = selected?.label ?? placeholder ?? items[0]?.label ?? ''
  const listboxId = id ? `${id}-listbox` : generatedListboxId
  const hasError = invalid || Boolean(error) || fieldState === 'error'

  function handleChange(nextValue: string) {
    onValueChange?.(nextValue)

    if (!onChange) return

    const event = {
      target: { value: nextValue },
    } as ChangeEvent<HTMLSelectElement>

    onChange(event)
  }

  return (
    <div className="w-full space-y-2">
      {label ? (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-900">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      <Dropdown
        className="w-full"
        align="left"
        onOpenChange={setOpen}
        portal
        panelRole="listbox"
        matchTriggerWidth
        offset={16}
        trigger={
          <button
            id={id}
            type="button"
            role="combobox"
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-controls={listboxId}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              'relative flex min-h-[42px] w-full items-center rounded-[12px] border border-[#cbd5e1] bg-white px-3 py-[11px] pr-11 text-left text-sm shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors duration-200 ease-out',
              hasError && 'border-red-300',
              open && 'border-[#63afe3] shadow-[inset_0_0_0_1px_rgba(99,175,227,0.82)]',
              disabled && 'cursor-not-allowed bg-slate-100 opacity-70',
              className,
            )}
          >
            <span
              className={cn(
                'block min-w-0 flex-1 truncate leading-5',
                !selected ? 'font-medium text-slate-400' : 'font-medium text-slate-900',
              )}
            >
              {display}
            </span>
            <span
              className={cn(
                'pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-400 transition duration-150',
                open && 'rotate-180 text-[#2f91d0]',
              )}
            >
              <ChevronDown className="h-[18px] w-[18px]" />
            </span>
          </button>
        }
        panelClassName="overflow-y-auto p-1.5"
      >
        {({ close }) => (
          <div id={listboxId} className="space-y-1">
            {items.map((item) => (
              <button
                key={item.value || `option-${item.label}`}
                type="button"
                role="option"
                disabled={item.disabled}
                aria-selected={item.value === currentValue}
                onClick={() => {
                  if (item.disabled) return
                  handleChange(item.value)
                  close()
                }}
                className={cn(
                  'flex min-h-10 w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-left text-sm transition-colors duration-150',
                  item.disabled && 'cursor-not-allowed opacity-50',
                  item.value === currentValue
                    ? 'bg-[#edf8ff] font-semibold text-[#2f91d0]'
                    : 'font-medium text-slate-700 hover:bg-[#edf8ff] hover:text-slate-900',
                )}
              >
                <span className="whitespace-nowrap">{item.label}</span>
                <span
                  className={cn(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[#2f91d0] transition-opacity duration-150',
                    item.value === currentValue ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden="true"
                >
                  <Check className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        )}
      </Dropdown>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}
