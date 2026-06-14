'use client'

import * as React from 'react'
import Image, { type ImageProps as NextImageProps } from 'next/image'
import { ImageOff } from 'lucide-react'

import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRjlGQUZCIi8+PC9zdmc+'

export interface LazyImageProps
  extends Omit<NextImageProps, 'blurDataURL' | 'onError' | 'onLoad' | 'placeholder'> {
  wrapperClassName?: string
  fallbackIcon?: React.ReactNode
}

export const LazyImage = React.forwardRef<HTMLDivElement, LazyImageProps>(
  (
    {
      alt,
      className,
      fallbackIcon,
      src,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false)
    const [hasError, setHasError] = React.useState<boolean>(false)

    React.useEffect(() => {
      setIsLoaded(false)
      setHasError(false)
    }, [src])

    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden bg-surface', wrapperClassName)}
      >
        {!isLoaded && !hasError ? (
          <Skeleton className="absolute inset-0 size-full" />
        ) : null}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface text-text-muted">
            {fallbackIcon ?? <ImageOff className="size-8" aria-hidden="true" />}
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={cn(
              'transition-base',
              isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
              className,
            )}
            onLoad={() => {
              setIsLoaded(true)
            }}
            onError={() => {
              setHasError(true)
            }}
            {...props}
          />
        )}
      </div>
    )
  },
)

LazyImage.displayName = 'LazyImage'
