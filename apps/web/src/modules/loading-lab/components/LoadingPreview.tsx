'use client'

import * as React from 'react'
import {
  Box,
  CheckCircle2,
  CreditCard,
  PackagePlus,
  ShoppingCart,
} from 'lucide-react'

import { Button } from '@/components/ui'
import { cn } from '@lego-shop/ui'
import type { AnimationId } from './LoadingLabClient'

interface LoadingPreviewProps {
  activeId: AnimationId
  isSimulating: boolean
}

export function LoadingPreview({ activeId, isSimulating }: LoadingPreviewProps) {
  if (activeId === 'brick-stack') {
    return <RouteTransitionPreview isSimulating={isSimulating} />
  }

  if (activeId === 'cube-spin') {
    return (
      <PreviewShell label="Loading collection">
        <BrickCubeLoader />
      </PreviewShell>
    )
  }

  if (activeId === 'checkout-rail') {
    return <CheckoutPreview isSimulating={isSimulating} />
  }

  return <AddToCartPreview isSimulating={isSimulating} />
}

function RouteTransitionPreview({
  isSimulating,
}: Pick<LoadingPreviewProps, 'isSimulating'>) {
  return (
    <div className="relative h-[360px] w-full max-w-wide overflow-hidden rounded-md border border-border bg-background shadow-lg">
      <div className="grid h-full grid-rows-[auto_1fr]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-display text-body-lg font-semibold">Figure Lab</span>
          <span className="rounded-full bg-surface px-3 py-1 text-body-xs text-text-muted">
            Collection page
          </span>
        </div>
        <div className="grid place-items-center p-8">
          <div className="grid w-full max-w-content gap-4">
            <div className="skeleton h-9 rounded-md" />
            <div className="skeleton h-5 rounded-md" />
            <div className="skeleton h-5 w-3/4 rounded-md" />
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="skeleton aspect-square rounded-md" />
              <div className="skeleton aspect-square rounded-md" />
              <div className="skeleton aspect-square rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-0 grid place-items-center bg-background/90 backdrop-blur-sm transition-base',
          isSimulating ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden={!isSimulating}
      >
        <BrickStackLoader />
      </div>
    </div>
  )
}

interface PreviewShellProps {
  children: React.ReactNode
  label: string
}

function PreviewShell({ children, label }: PreviewShellProps) {
  return (
    <div className="grid min-h-[320px] w-full max-w-content place-items-center rounded-md border border-border bg-background p-8 shadow-lg">
      <div className="flex flex-col items-center gap-5 text-center">
        {children}
        <p className="text-body-sm font-semibold text-text-secondary">{label}</p>
      </div>
    </div>
  )
}

function AddToCartPreview({
  isSimulating,
}: Pick<LoadingPreviewProps, 'isSimulating'>) {
  return (
    <div className="grid w-full max-w-content gap-4 rounded-md border border-border bg-background p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="grid size-20 place-items-center rounded-md bg-surface">
          <Box className="size-9 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-body-lg font-semibold text-text-primary">
            Technic wall frame
          </h3>
          <p className="mt-1 text-body-sm text-text-muted">40 x 30 cm - Oak frame</p>
        </div>
      </div>

      <Button className="w-full">
        {isSimulating ? <BouncingBlocksLoader /> : 'Them vao gio hang'}
      </Button>

      <div
        className={cn(
          'flex items-center gap-2 rounded-md border border-success bg-surface p-3 text-body-sm font-semibold text-text-primary transition-base',
          isSimulating ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
        Dang them vao gio hang...
      </div>
    </div>
  )
}

function CheckoutPreview({
  isSimulating,
}: Pick<LoadingPreviewProps, 'isSimulating'>) {
  return (
    <div className="grid w-full max-w-wide gap-6 rounded-md border border-border bg-background p-6 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-display-sm text-text-primary">Checkout</h3>
          <p className="mt-1 text-body-sm text-text-muted">
            Preview payment processing loader
          </p>
        </div>
        <CreditCard className="size-7 text-primary" aria-hidden="true" />
      </div>

      <div className="loading-checkout-rail" aria-label="Dang xu ly don hang">
        <span className="loading-checkout-rail__cart">
          <ShoppingCart className="size-8" aria-hidden="true" />
        </span>
        <span className="loading-checkout-rail__brick loading-checkout-rail__brick--red" />
        <span className="loading-checkout-rail__brick loading-checkout-rail__brick--yellow" />
        <span className="loading-checkout-rail__brick loading-checkout-rail__brick--blue" />
      </div>

      <Button
        className="w-full"
        leftIcon={
          isSimulating ? (
            <PackagePlus className="size-4 animate-pulse" aria-hidden="true" />
          ) : (
            <CreditCard className="size-4" aria-hidden="true" />
          )
        }
      >
        {isSimulating ? 'Dang lap don hang...' : 'Thanh toan'}
      </Button>
    </div>
  )
}

function BrickStackLoader() {
  return (
    <div className="brick-stack-loader" role="status" aria-label="Dang lap khung">
      <span className="brick-stack-loader__brick brick-stack-loader__brick--red" />
      <span className="brick-stack-loader__brick brick-stack-loader__brick--yellow" />
      <span className="brick-stack-loader__brick brick-stack-loader__brick--blue" />
      <span className="brick-stack-loader__brick brick-stack-loader__brick--red brick-stack-loader__brick--small" />
      <span className="brick-stack-loader__shadow" />
      <span className="mt-5 text-body-sm font-semibold text-text-primary">
        Dang lap khung...
      </span>
    </div>
  )
}

function BrickCubeLoader() {
  return (
    <div className="brick-cube-loader" role="status" aria-label="Dang tai">
      <span />
    </div>
  )
}

function BouncingBlocksLoader() {
  return (
    <span className="brick-bounce-loader" role="status" aria-label="Dang xu ly">
      <i />
      <i />
      <i />
      <span className="sr-only">Dang xu ly</span>
    </span>
  )
}
