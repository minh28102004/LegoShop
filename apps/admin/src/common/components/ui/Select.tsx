import {
  Children,
  isValidElement,
  useMemo,
  useId,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { cn } from '@/common/utils/cn';
import Dropdown from '@/common/components/ui/Dropdown';

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  invalid?: boolean;
  options?: SelectOption[];
  children?: ReactNode;
  placeholder?: string;
};

function ChevronDown() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-[18px] w-[18px]' aria-hidden='true'>
      <path
        d='M5 7.5L10 12.5L15 7.5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M4.5 10.5L8 14L15.5 6.5'
        stroke='currentColor'
        strokeWidth='1.9'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function parseOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children)
    .flatMap((child) => {
      if (!isValidElement<{ value?: string; children?: ReactNode }>(child)) return [];
      if (child.type === 'option') {
        const option = child as ReactElement<{ value?: string; children?: ReactNode }>;
        return [
          {
            value: option.props.value ?? '',
            label: String(option.props.children ?? ''),
          },
        ];
      }
      return [];
    });
}

export default function Select({
  className,
  invalid = false,
  options,
  children,
  value,
  onChange,
  placeholder,
  ...props
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const generatedListboxId = useId();
  const items = useMemo(() => {
    if (options && options.length > 0) return options;
    return parseOptions(children);
  }, [children, options]);

  const currentValue = String(value ?? '');
  const selected = items.find((item) => item.value === currentValue);
  const display = selected?.label ?? placeholder ?? items[0]?.label ?? '';
  const ariaLabel = props['aria-label'] ?? display;
  const ariaDescribedBy = props['aria-describedby'];
  const listboxId = props.id ? `${props.id}-listbox` : generatedListboxId;

  function handleChange(nextValue: string) {
    if (!onChange) return;

    const event = {
      target: { value: nextValue },
    } as ChangeEvent<HTMLSelectElement>;

    onChange(event);
  }

  return (
    <Dropdown
      className='w-full'
      align='left'
      onOpenChange={setOpen}
      portal
      panelRole='listbox'
      matchTriggerWidth
      offset={16}
      trigger={
        <button
          id={props.id}
          type='button'
          role='combobox'
          disabled={props.disabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup='listbox'
          className={cn(
            'admin-control admin-control-md relative flex min-h-[42px] items-center pr-11 text-left text-sm',
            invalid && 'is-invalid',
            open && 'border-[var(--admin-primary)] shadow-[var(--admin-focus-ring)]',
            props.disabled && 'cursor-not-allowed bg-slate-100 opacity-70',
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
              open && 'rotate-180 text-[var(--admin-primary-strong)]',
            )}
          >
            <ChevronDown />
          </span>
        </button>
      }
      panelClassName='admin-scrollbar overflow-y-auto p-1.5'
    >
      {({ close }) => (
        <div id={listboxId} className='space-y-1'>
          {items.map((item) => (
            <button
              key={item.value || `option-${item.label}`}
              type='button'
              role='option'
              aria-selected={item.value === currentValue}
              onClick={() => {
                handleChange(item.value);
                close();
              }}
              className={cn(
                'flex min-h-10 w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-left text-sm transition-colors duration-150',
                item.value === currentValue
                  ? 'bg-[var(--admin-primary-soft)] font-semibold text-[var(--admin-primary-strong)]'
                  : 'font-medium text-slate-700 hover:bg-[var(--admin-primary-soft)] hover:text-slate-900',
              )}
            >
              <span className='whitespace-nowrap'>{item.label}</span>
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[var(--admin-primary-strong)] transition-opacity duration-150',
                  item.value === currentValue ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden='true'
              >
                <CheckIcon />
              </span>
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}
