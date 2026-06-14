import { Container } from '@/components/layout/Container'

export default function Loading() {
  return (
    <section className="min-h-[80dvh] bg-background py-16">
      <Container>
        <div className="mb-12 flex items-center justify-center">
          <div className="grid size-16 place-items-center rounded-md bg-primary text-body-lg font-semibold text-primary-foreground shadow-lg">
            BF
          </div>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div className="space-y-6">
            <div className="skeleton h-5 w-40 rounded-full" />
            <div className="space-y-4">
              <div className="skeleton h-14 w-full max-w-wide rounded-md" />
              <div className="skeleton h-14 w-4/5 rounded-md" />
            </div>
            <div className="space-y-3">
              <div className="skeleton h-5 w-full max-w-content rounded-md" />
              <div className="skeleton h-5 w-3/4 rounded-md" />
            </div>
            <div className="flex gap-3">
              <div className="skeleton h-12 w-36 rounded-md" />
              <div className="skeleton h-12 w-36 rounded-md" />
            </div>
          </div>
          <div className="skeleton aspect-square rounded-md" />
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="skeleton h-32 rounded-md" />
          <div className="skeleton h-32 rounded-md" />
          <div className="skeleton h-32 rounded-md" />
        </div>
      </Container>
    </section>
  )
}
