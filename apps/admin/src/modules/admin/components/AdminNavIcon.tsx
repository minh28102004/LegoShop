import { type AdminNavIcon as AdminNavIconName } from '@/common/constants/routes';

type AdminNavIconProps = {
  name: AdminNavIconName;
  className?: string;
};

export default function AdminNavIcon({ name, className }: AdminNavIconProps) {
  const iconClass = className ?? 'h-[18px] w-[18px]';

  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M4 13H10V20H4V13Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M14 4H20V11H14V4Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M14 15H20V20H14V15Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M4 4H10V9H4V4Z' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'products':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M3 8L12 3L21 8L12 13L3 8Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M3 8V16L12 21L21 16V8' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'frameOptions':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='4' y='4' width='16' height='16' rx='3' stroke='currentColor' strokeWidth='1.8' />
          <path d='M8 8H16V16H8V8Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M12 4V8M12 16V20M4 12H8M16 12H20' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
        </svg>
      );
    case 'templates':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='4' y='4' width='16' height='16' rx='2' stroke='currentColor' strokeWidth='1.8' />
          <path d='M8 8H16M8 12H16M8 16H13' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
        </svg>
      );
    case 'accessories':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M8 7L12 3L16 7L12 11L8 7Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M7 12L3 16L8 21L12 17L7 12Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M17 12L12 17L16 21L21 16L17 12Z' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'banners':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='3' y='5' width='18' height='14' rx='2' stroke='currentColor' strokeWidth='1.8' />
          <path d='M3 10H21' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'frameBackgrounds':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='4' y='4' width='16' height='16' rx='3' stroke='currentColor' strokeWidth='1.8' />
          <path
            d='M7.5 16L10 13.5C10.45 13.05 11.18 13.05 11.63 13.5L13 14.87L14.87 13C15.32 12.55 16.05 12.55 16.5 13L19 15.5'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <circle cx='9' cy='8.75' r='1.35' fill='currentColor' />
        </svg>
      );
    case 'collections':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='4' y='6' width='16' height='12' rx='2' stroke='currentColor' strokeWidth='1.8' />
          <path d='M9 6V18M15 6V18' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'orders':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M7 5H17V19H7V5Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M10 9H14M10 13H14' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
        </svg>
      );
    case 'businessInquiries':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M4 6H20V18H4V6Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M4 8L12 13L20 8' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'paymentSettings':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='1.8' />
          <path
            d='M19.4 15A1 1 0 0 0 19.6 16.1L19.7 16.2A1 1 0 0 1 19.7 17.6L17.6 19.7A1 1 0 0 1 16.2 19.7L16.1 19.6A1 1 0 0 0 15 19.4A1 1 0 0 0 14.4 20.3V20.5A1 1 0 0 1 13.4 21.5H10.6A1 1 0 0 1 9.6 20.5V20.3A1 1 0 0 0 9 19.4A1 1 0 0 0 7.9 19.6L7.8 19.7A1 1 0 0 1 6.4 19.7L4.3 17.6A1 1 0 0 1 4.3 16.2L4.4 16.1A1 1 0 0 0 4.6 15A1 1 0 0 0 3.7 14.4H3.5A1 1 0 0 1 2.5 13.4V10.6A1 1 0 0 1 3.5 9.6H3.7A1 1 0 0 0 4.6 9A1 1 0 0 0 4.4 7.9L4.3 7.8A1 1 0 0 1 4.3 6.4L6.4 4.3A1 1 0 0 1 7.8 4.3L7.9 4.4A1 1 0 0 0 9 4.6A1 1 0 0 0 9.6 3.7V3.5A1 1 0 0 1 10.6 2.5H13.4A1 1 0 0 1 14.4 3.5V3.7A1 1 0 0 0 15 4.6A1 1 0 0 0 16.1 4.4L16.2 4.3A1 1 0 0 1 17.6 4.3L19.7 6.4A1 1 0 0 1 19.7 7.8L19.6 7.9A1 1 0 0 0 19.4 9A1 1 0 0 0 20.3 9.6H20.5A1 1 0 0 1 21.5 10.6V13.4A1 1 0 0 1 20.5 14.4H20.3A1 1 0 0 0 19.4 15Z'
            stroke='currentColor'
            strokeWidth='1.4'
            strokeLinejoin='round'
          />
        </svg>
      );
    default:
      return null;
  }
}
