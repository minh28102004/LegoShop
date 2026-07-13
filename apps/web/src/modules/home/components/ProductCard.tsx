import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'

type ProductCardProps = {
  badge: string
  description: string
  href: string
  image: string
  priceLabel: string
  title: string
}

export function ProductCard({
  badge,
  description,
  href,
  image,
  priceLabel,
  title,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm transition-base hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[1/0.92] overflow-hidden bg-primary/5">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 border-0 bg-[linear-gradient(135deg,#FFF2B6_0%,#F6D76B_100%)] px-3 py-1 text-[11px] font-bold text-text-primary shadow-sm">
          {badge}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <h3 className="font-body text-[1.05rem] font-bold leading-6 tracking-[-0.03em] text-text-primary">
            {title}
          </h3>
          <p className="line-clamp-3 text-sm text-text-secondary">{description}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <span className="text-sm font-extrabold text-primary sm:text-base">
            {priceLabel}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 bg-primary/5 text-primary transition-base group-hover:bg-primary group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
