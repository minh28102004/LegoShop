'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn, type ImageProps, type Size } from '@lego-shop/ui'

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface font-semibold text-text-secondary',
  {
    variants: {
      size: {
        sm: 'size-8 text-body-xs',
        md: 'size-10 text-body-sm',
        lg: 'size-12 text-body-md',
        xl: 'size-16 text-body-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<'div'>,
    Omit<VariantProps<typeof avatarVariants>, 'size'> {
  src?: ImageProps['src']
  alt?: ImageProps['alt']
  name: string
  size?: Extract<Size, 'sm' | 'md' | 'lg' | 'xl'>
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ alt, className, name, size, src, ...props }, ref) => {
    const [hasImageError, setHasImageError] = React.useState<boolean>(false)
    const shouldShowImage = src !== undefined && !hasImageError

    React.useEffect(() => {
      setHasImageError(false)
    }, [src])

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {shouldShowImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? name}
            className="size-full object-cover"
            onError={() => {
              setHasImageError(true)
            }}
          />
        ) : (
          <span aria-hidden="true">{getInitials(name)}</span>
        )}
      </div>
    )
  },
)

Avatar.displayName = 'Avatar'
