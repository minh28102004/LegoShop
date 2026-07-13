export type HomeCta = {
  label: string
  href: string
}

export type HomeHero = {
  eyebrow: string
  title: string
  description: string
  image: string
  primaryCta: HomeCta
  secondaryCta: HomeCta
  socialProof: string
  customerName: string
  customerMeta: string
}

export type HomeStat = {
  value: string
  label: string
}

export type HomeStory = {
  eyebrow: string
  title: string
  lead: string
  paragraphs: string[]
  image: string
  cta: HomeCta
}

export type HomeCategory = {
  title: string
  description: string
  href: string
  image: string
}

export type HomeFeaturedProduct = {
  id: string
  title: string
  description: string
  priceLabel: string
  image: string
  badge: string
  href: string
}

export type HomeValueProp = {
  title: string
  description: string
  icon: 'sparkles' | 'drafting' | 'gift' | 'briefcase'
}

export type HomeOrderStep = {
  step: string
  title: string
  description: string
}

export type HomeTestimonial = {
  name: string
  role: string
  quote: string
  rating: number
}

export type HomeSocialPost = {
  id: string
  image: string
  alt: string
}

export type HomeFinalCta = {
  eyebrow: string
  title: string
  description: string
  primaryCta: HomeCta
  secondaryCta: HomeCta
}
