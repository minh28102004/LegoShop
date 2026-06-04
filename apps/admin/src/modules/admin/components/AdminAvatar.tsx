'use client';

import { useMemo, useState } from 'react';

export const avatarColors = [
  'bg-slate-500',
  'bg-zinc-500',
  'bg-stone-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
];

export const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export const getInitials = (name?: string | null, email?: string): string => {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0]?.toUpperCase() || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0]?.toUpperCase() : '';
    return first + last || name[0]?.toUpperCase() || 'A';
  }

  return email?.[0]?.toUpperCase() || 'A';
};

type Status = 'online' | 'busy' | 'offline' | 'none';

const statusColor: Record<Exclude<Status, 'none'>, string> = {
  online: 'bg-emerald-500',
  busy: 'bg-amber-500',
  offline: 'bg-slate-400',
};

type AdminAvatarProps = {
  name?: string | null;
  email?: string;
  src?: string | null;
  avatarUrl?: string | null;
  size?: number | string;
  className?: string;
  ringClassName?: string;
  status?: Status;
};

export default function AdminAvatar({
  name = 'Admin',
  email,
  src,
  avatarUrl,
  size = 36,
  className = '',
  ringClassName = '',
  status = 'none',
}: AdminAvatarProps) {
  const imageUrl = src || avatarUrl || '';
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const { isNumberSize, pixelSize, fontSize } = useMemo(() => {
    const isNumberSize = typeof size === 'number';
    const pixelSize = isNumberSize ? `${size}px` : undefined;
    const fontSize = isNumberSize ? `${Math.max(10, Math.round(Number(size) / 2.2))}px` : undefined;

    return { isNumberSize, pixelSize, fontSize };
  }, [size]);

  const displayName = name?.trim() || email || 'Admin';
  const bgColor = useMemo(() => getColorFromName(displayName), [displayName]);
  const initials = useMemo(() => getInitials(name, email), [email, name]);
  const showImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;

  return (
    <div
      className={[
        'relative flex items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        'shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)]',
        bgColor,
        typeof size === 'string' ? size : '',
        ringClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        isNumberSize
          ? {
              width: pixelSize,
              height: pixelSize,
              fontSize,
            }
          : undefined
      }
      aria-label={displayName}
      title={displayName}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={displayName}
          className='absolute inset-0 h-full w-full object-cover'
          onError={() => setFailedImageUrl(imageUrl)}
          draggable={false}
        />
      ) : (
        <span className='z-10 leading-none'>{initials}</span>
      )}

      {status !== 'none' ? (
        <span
          className={[
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white',
            statusColor[status],
          ].join(' ')}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
