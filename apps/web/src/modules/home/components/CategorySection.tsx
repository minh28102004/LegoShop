import { PageContainer } from '@/components/layout/PageContainer'

import type { HomeCategory } from '@/modules/home/types/home.types'
import { CategoryCard } from './CategoryCard'
import { SectionHeader } from './SectionHeader'

type CategorySectionProps = {
  categories: HomeCategory[]
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section id="categories" className="pt-14 md:pt-[88px]">
      <PageContainer>
        <SectionHeader
          align="center"
          eyebrow="Curated collections"
          title="Những hướng quà được chọn nhiều nhất"
          subtitle="Từ những món quà lãng mạn đến quà tri ân lớp học và doanh nghiệp, mỗi bộ sưu tập đều mang một ngôn ngữ thẩm mỹ riêng."
          className="mb-9"
        />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </PageContainer>
    </section>
  )
}
