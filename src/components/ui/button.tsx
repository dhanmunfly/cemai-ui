import React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  default: 'bg-blue-600 hover:bg-blue-500 text-white',
  outline: 'border border-white/20 hover:bg-white/10 text-white',
  destructive: 'bg-red-600 hover:bg-red-500 text-white',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-2 py-1 text-sm rounded',
  md: 'px-3 py-2 text-sm rounded-md',
  lg: 'px-4 py-2 text-base rounded-md',
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button ref={ref} className={cn(variantClass[variant], sizeClass[size], className)} {...props} />
  )
)
Button.displayName = 'Button'


