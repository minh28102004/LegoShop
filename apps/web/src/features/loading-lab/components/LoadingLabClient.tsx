'use client'

import * as React from 'react'
import {
  Play,
  Route,
  ShoppingCart,
} from 'lucide-react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { LoadingPreview } from './LoadingPreview'

type LoadingContext = 'route' | 'cart'
export type AnimationId =
  | 'brick-stack'
  | 'cube-spin'
  | 'bounce-blocks'
  | 'checkout-rail'

interface AnimationOption {
  id: AnimationId
  context: LoadingContext
  title: string
  description: string
  duration: string
}

const DEFAULT_ANIMATION: AnimationOption = {
  id: 'brick-stack',
  context: 'route',
  title: 'Brick Stacking',
  description: 'Page transition loader: cac khoi gach lap thanh khung.',
  duration: '< 2s loop',
}

const ANIMATIONS: AnimationOption[] = [
  DEFAULT_ANIMATION,
  {
    id: 'cube-spin',
    context: 'route',
    title: '3D Brick Cube',
    description: 'Fallback nhe cho route change hoac empty screen.',
    duration: '1.1s loop',
  },
  {
    id: 'bounce-blocks',
    context: 'cart',
    title: 'Bouncing LEGO Blocks',
    description: 'Micro-loading cho add to cart button.',
    duration: '750ms loop',
  },
  {
    id: 'checkout-rail',
    context: 'cart',
    title: 'Checkout Assembly',
    description: 'Checkout action: gach chay vao cart va complete.',
    duration: '1.4s loop',
  },
]

const CONTEXT_LABEL: Record<LoadingContext, string> = {
  route: 'Page transition',
  cart: 'Add to cart / checkout',
}

export function LoadingLabClient() {
  const [activeId, setActiveId] = React.useState<AnimationId>('brick-stack')
  const [isSimulating, setIsSimulating] = React.useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(false)

  const activeOption = ANIMATIONS.find((option) => option.id === activeId) ?? DEFAULT_ANIMATION

  React.useEffect(() => {
    if (!isAutoPlaying) return undefined

    const interval = window.setInterval(() => {
      setActiveId((currentId) => {
        const currentIndex = ANIMATIONS.findIndex((option) => option.id === currentId)
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ANIMATIONS.length
        return (ANIMATIONS[nextIndex] ?? DEFAULT_ANIMATION).id
      })
      setIsSimulating(true)
    }, 1800)

    return () => window.clearInterval(interval)
  }, [isAutoPlaying])

  React.useEffect(() => {
    if (!isSimulating) return undefined

    const timeout = window.setTimeout(() => {
      setIsSimulating(false)
    }, activeOption.context === 'route' ? 1600 : 1100)

    return () => window.clearTimeout(timeout)
  }, [activeOption.context, isSimulating])

  return (
    <section className="min-h-[80dvh] bg-surface py-16">
      <div className="mx-auto grid w-full max-w-screen-2xl gap-8 px-4 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="space-y-6">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-wide text-primary">
              BrickFrames motion lab
            </p>
            <h1 className="mt-3 text-display-md text-text-primary">
              Loading animation sandbox
            </h1>
            <p className="mt-3 text-body-md text-text-secondary">
              Chay thu tung loader voi mau do, vang, xanh theo tinh than brick toy.
            </p>
          </div>

          <div className="rounded-md border border-border bg-background p-3 shadow-sm">
            {ANIMATIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setActiveId(option.id)
                  setIsSimulating(false)
                  setIsAutoPlaying(false)
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md p-3 text-left transition-base',
                  activeId === option.id
                    ? 'bg-surface text-text-primary'
                    : 'text-text-secondary hover:bg-surface',
                )}
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-background text-primary shadow-xs">
                  {option.context === 'route' ? (
                    <Route className="size-4" aria-hidden="true" />
                  ) : (
                    <ShoppingCart className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-body-sm font-semibold">{option.title}</span>
                  <span className="mt-1 block text-body-xs text-text-muted">
                    {CONTEXT_LABEL[option.context]} - {option.duration}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-md border border-border bg-background shadow-md">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-body-sm font-semibold text-primary">
                {CONTEXT_LABEL[activeOption.context]}
              </p>
              <h2 className="mt-1 text-display-sm text-text-primary">
                {activeOption.title}
              </h2>
              <p className="mt-2 text-body-sm text-text-secondary">
                {activeOption.description}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  const nextIsAutoPlaying = !isAutoPlaying
                  setIsAutoPlaying(nextIsAutoPlaying)
                  setIsSimulating(nextIsAutoPlaying)
                }}
                leftIcon={<Play className="size-4" aria-hidden="true" />}
              >
                {isAutoPlaying ? 'Stop auto' : 'Auto play all'}
              </Button>
              <Button
                onClick={() => {
                  setIsAutoPlaying(false)
                  setIsSimulating(true)
                }}
                leftIcon={<Play className="size-4" aria-hidden="true" />}
              >
                Simulate
              </Button>
            </div>
          </div>

          <div className="relative grid min-h-[520px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--color-primary)/0.08),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--color-accent)/0.12),transparent_30%)] p-6">
            <LoadingPreview activeId={activeOption.id} isSimulating={isSimulating} />
          </div>
        </div>
      </div>
    </section>
  )
}
