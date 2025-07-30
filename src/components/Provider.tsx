'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'

type ProviderProps = {
  children: React.ReactNode
}

export default function Provider({ children }: ProviderProps) {
  const client = useMemo(() => new QueryClient(), [])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
