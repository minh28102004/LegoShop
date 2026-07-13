'use client'

import * as React from 'react'

import { cn } from '../cn'
import { Button, type ButtonProps } from './Button'

type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  size?: IconButtonSize
}

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: 'h-9 w-9 rounded-[10px] p-0',
  md: 'h-10 w-10 rounded-[12px] p-0',
  lg: 'h-11 w-11 rounded-[14px] p-0',
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', children, ...props }, ref) => (
    <Button
      ref={ref}
      size="md"
      className={cn(SIZE_CLASS[size], className)}
      {...props}
    >
      {children}
    </Button>
  ),
)

IconButton.displayName = 'IconButton'
