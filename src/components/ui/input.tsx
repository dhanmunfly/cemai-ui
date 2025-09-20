import React from 'react'
import { cn } from '@/lib/utils'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, Props>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn('px-3 py-2 rounded-md bg-black/50 border border-white/20 outline-none text-white placeholder:text-white/50', className)}
    {...props}
  />
))
Input.displayName = 'Input'


