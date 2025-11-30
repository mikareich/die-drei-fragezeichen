import { ReloadIcon } from '@radix-ui/react-icons'
import { cva } from 'class-variance-authority'
import React from 'react'
import cn from '~/utils/cn'

const buttonStyles = cva(
  'py-3 px-4 text-base uppercase border-2 flex overflow-hidden items-center gap-4 font-bold cursor-pointer transition-all outline-0',
  {
    variants: {
      mode: {
        filled: 'bg-gray-950 border-gray-950 text-gray-50',
        destructive: 'bg-red-500 border-red-500 text-gray-50 ',
        outlined: ' text-gray-950 border-gray-950',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    compoundVariants: [
      {
        mode: 'filled',
        disabled: false,
        className: 'hover:bg-gray-700 focus-within:bg-gray-700',
      },
      {
        mode: 'destructive',
        disabled: false,
        className: 'hover:bg-red-400 focus-within:bg-red-400',
      },
      {
        mode: 'outlined',
        disabled: false,
        className: 'hover:bg-gray-300 focus-within:bg-gray-300',
      },
      {
        disabled: false,
        className: '',
      },
    ],
  },
)

type ButtonProps = React.ComponentProps<'button'> & {
  mode?: 'filled' | 'outlined' | 'destructive'
  loading?: boolean
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
}

export default function Button({
  children,
  className,
  type,
  mode = 'filled',
  disabled = false,
  loading = false,
  prefixIcon,
  suffixIcon,
  ...props
}: ButtonProps) {
  const renderDisabled = disabled || loading

  const prefixIconClassName =
    React.isValidElement<HTMLElement>(prefixIcon) && prefixIcon.props?.className

  const effectivePrefixIcon = loading ? (
    <ReloadIcon
      // merge all styles of the `prefixIcon` with the loading spinner
      className={cn('size-6 animate-spin', prefixIconClassName)}
    />
  ) : (
    prefixIcon
  )

  return (
    <button
      type={type}
      disabled={renderDisabled}
      className={cn(
        buttonStyles({ mode, disabled: renderDisabled }),
        className,
      )}
      {...props}
    >
      {effectivePrefixIcon && <span>{effectivePrefixIcon}</span>}

      {children && <span className="truncate">{children}</span>}

      {suffixIcon && <span>{suffixIcon}</span>}
    </button>
  )
}
