'use client'

import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as RSelect from '@radix-ui/react-select'
import type React from 'react'
import Button from './Button'

type SelectProps = RSelect.SelectProps & {
  triggerProps?: Omit<Parameters<typeof Button>[0], 'children' | 'suffixIcon'>
  options: Map<string, React.ReactNode>
}

export default function Select({
  children,
  triggerProps,
  options,
  value,
  ...props
}: SelectProps) {
  return (
    <RSelect.Root value={value} {...props}>
      <RSelect.Trigger asChild>
        <Button
          suffixIcon={<ChevronDownIcon className="size-6" />}
          {...triggerProps}
        >
          {value ? options.get(value) : children}
        </Button>
      </RSelect.Trigger>

      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={16}
          className="bg-white border-2 border-gray-950 overflow-hidden max-h-[var(--radix-popper-available-height)]"
        >
          <RSelect.ScrollUpButton className="flex items-center justify-center py-1.5">
            <ChevronUpIcon className="size-4 text-gray-950" />
          </RSelect.ScrollUpButton>

          <RSelect.Viewport>
            {Array.from(options.entries()).map(([value, children]) => (
              <RSelect.Item
                className="px-4 py-3 hover:bg-gray-300 data-highlighted:bg-gray-300 outline-0"
                key={value}
                value={value}
              >
                {children}
              </RSelect.Item>
            ))}
          </RSelect.Viewport>

          <RSelect.ScrollDownButton className="flex items-center justify-center py-1.5">
            <ChevronDownIcon className="size-4 text-gray-950" />
          </RSelect.ScrollDownButton>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}
