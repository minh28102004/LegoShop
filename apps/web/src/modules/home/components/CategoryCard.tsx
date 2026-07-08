import Link from 'next/link'

type CategoryCardProps = {
  title: string
  description: string
  href: string
  image: string
}

export function CategoryCard({
  description,
  href,
  image,
  title,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[22px] border border-white/70 bg-slate-200 shadow-sm"
    >
      <div className="relative aspect-[1.14/1] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,29,58,0.06)_0%,rgba(7,29,58,0.2)_42%,rgba(7,29,58,0.86)_100%)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-white sm:p-5">
        <h3 className="font-body text-lg font-bold tracking-[-0.03em] text-white">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm text-white/82">{description}</p>
      </div>
    </Link>
  )
}
