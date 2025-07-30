import type React from 'react'
import cn from '~/utils/cn'

type LabelProps = React.ComponentProps<'div'> & {
  children: React.ReactNode
  description: React.ReactNode
}

export default function Label({
  description,
  children,
  className,
  ...props
}: LabelProps) {
  return (
    <div className={cn('space-y-1 truncate', className)} {...props}>
      <span className="block truncate font-medium text-base text-gray-500 uppercase">
        {description}
      </span>

      {children}
    </div>
  )
}
