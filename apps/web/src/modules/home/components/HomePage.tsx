import {
  HOME_CATEGORIES,
  HOME_FEATURED_PRODUCTS,
  HOME_FINAL_CTA,
  HOME_HERO,
  HOME_ORDER_STEPS,
  HOME_SOCIAL_POSTS,
  HOME_STATS,
  HOME_STORY,
  HOME_TESTIMONIALS,
  HOME_VALUE_PROPS,
} from '../data/home.data'
import { CategorySection } from './CategorySection'
import { CorporateBanner } from './CorporateBanner'
import { FeaturedProducts } from './FeaturedProducts'
import { FinalCtaSection } from './FinalCtaSection'
import { HeroSection } from './HeroSection'
import { HowToOrder } from './HowToOrder'
import { StatsSection } from './StatsSection'
import { StorySection } from './StorySection'
import { Testimonials } from './Testimonials'
import { WhyChooseUs } from './WhyChooseUs'

export function HomePage() {
  return (
    <div className="overflow-x-clip bg-[radial-gradient(circle_at_top_center,rgba(223,243,255,0.72),transparent_24%),#F5F8FC] pb-28 md:pb-24">
      <HeroSection hero={HOME_HERO} />
      <StatsSection stats={HOME_STATS} />
      <StorySection story={HOME_STORY} />
      <CategorySection categories={HOME_CATEGORIES} />
      <FeaturedProducts products={HOME_FEATURED_PRODUCTS} />
      <WhyChooseUs items={HOME_VALUE_PROPS} />
      <HowToOrder steps={HOME_ORDER_STEPS} />
      <CorporateBanner />
      <Testimonials items={HOME_TESTIMONIALS} />
      <FinalCtaSection cta={HOME_FINAL_CTA} items={HOME_SOCIAL_POSTS} />
    </div>
  )
}
