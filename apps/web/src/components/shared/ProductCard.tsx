'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Product } from '@lego-shop/shared'

import { Badge, Button, Card } from '@/components/ui'
import { ROUTES } from '@/config/routes'
import { resolveApiAssetUrl } from '@/lib/api/assets'
import { cn } from '@lego-shop/ui'
import { LazyImage } from './LazyImage'
import { PriceDisplay } from './PriceDisplay'
import { StarRating } from './StarRating'

const productCardVariants = cva('group overflow-hidden', {
  variants: {
    variant: {
      grid: 'flex flex-col',
      list: 'grid gap-5 md:grid-cols-[220px_1fr]',
      compact: 'grid grid-cols-[72px_1fr] gap-3 rounded-md border border-border bg-background p-2',
    },
  },
  defaultVariants: {
    variant: 'grid',
  },
})

export interface ProductCardProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof productCardVariants> {
  product: Product & {
    rating?: number
    reviewCount?: number
    shortDescription?: string
  }
  variant?: 'grid' | 'list' | 'compact'
}

const PRODUCT_IMAGE_PLACEHOLDER = '/window.svg'

function getProductImage(product: Product): string {
  return resolveApiAssetUrl(product.images[0]) || PRODUCT_IMAGE_PLACEHOLDER
}

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, product, variant = 'grid', ...props }, ref) => {
    const imageSrc = getProductImage(product)
    const rating = product.rating ?? 0
    const reviewCount = product.reviewCount
    const detailHref = ROUTES.creatorStudio

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(productCardVariants({ variant }), className)}
          {...props}
        >
          <LazyImage
            src={imageSrc}
            alt={product.name}
            width={72}
            height={72}
            wrapperClassName="size-[72px] rounded-md"
            className="size-full object-cover"
          />
          <div className="min-w-0">
            <Link
              href={detailHref}
              className="line-clamp-2 text-body-sm font-semibold text-text-primary hover:text-primary"
            >
              {product.name}
            </Link>
            <PriceDisplay price={product.basePrice} size="sm" className="mt-1" />
          </div>
        </div>
      )
    }

    if (variant === 'list') {
      return (
        <Card
          ref={ref}
          variant="outlined"
          hoverable
          className={cn(productCardVariants({ variant }), className)}
          {...props}
        >
          <Link href={detailHref} className="relative block overflow-hidden">
            <LazyImage
              src={imageSrc}
              alt={product.name}
              fill
              sizes="220px"
              wrapperClassName="aspect-[4/3] h-full min-h-48"
              className="object-cover transition-transform duration-normal ease-smooth group-hover:scale-105"
            />
            {product.featured ? (
              <Badge variant="primary" className="absolute left-3 top-3">
                Nổi bật
              </Badge>
            ) : null}
          </Link>
          <div className="flex min-w-0 flex-col gap-4 p-5">
            <div className="space-y-2">
              <Link href={detailHref} className="block">
                <h3 className="text-display-sm text-text-primary transition-base hover:text-primary">
                  {product.name}
                </h3>
              </Link>
              {rating > 0 ? (
                <StarRating rating={rating} count={reviewCount} />
              ) : (
                <p className="text-body-sm text-text-muted">Chưa có đánh giá</p>
              )}
              <p className="line-clamp-2 text-body-md text-text-secondary">
                {product.shortDescription ?? product.description ?? 'Khung trưng bày cao cấp cho bộ sưu tập gạch yêu thích của bạn.'}
              </p>
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
              <PriceDisplay price={product.basePrice} size="lg" />
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={detailHref}>Xem chi tiết</Link>
                </Button>
                <Button asChild leftIcon={<ShoppingBag className="size-4" />}>
                  <Link href={ROUTES.creatorStudio}>Tạo nhanh</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card
        ref={ref}
        variant="outlined"
        hoverable
        className={cn(productCardVariants({ variant }), className)}
        {...props}
      >
        <Link href={detailHref} className="relative block overflow-hidden">
          <LazyImage
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            wrapperClassName="aspect-square"
            className="object-cover transition-transform duration-normal ease-smooth group-hover:scale-105"
          />
          {product.featured ? (
            <Badge variant="primary" className="absolute left-3 top-3">
              Nổi bật
            </Badge>
          ) : null}
          <Button
            asChild
            size="sm"
            className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 shadow-md transition-base group-hover:translate-y-0 group-hover:opacity-100"
            leftIcon={<ShoppingBag className="size-4" />}
          >
            <Link href={ROUTES.creatorStudio}>Tùy chỉnh nhanh</Link>
          </Button>
        </Link>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Link href={detailHref} className="block">
            <h3 className="line-clamp-2 text-body-lg font-semibold text-text-primary transition-base hover:text-primary">
              {product.name}
            </h3>
          </Link>
          {rating > 0 ? (
            <StarRating rating={rating} count={reviewCount} />
          ) : (
            <p className="text-body-sm text-text-muted">Chưa có đánh giá</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-3">
            <PriceDisplay price={product.basePrice} />
            <Button asChild variant="ghost" size="sm" rightIcon={<ArrowRight className="size-4" />}>
              <Link href={detailHref}>Xem chi tiết</Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  },
)

ProductCard.displayName = 'ProductCard'
