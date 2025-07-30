'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import { QUERY_DEBOUNCE } from '~/utils/constants'

type DataTableProps = {
  queryPlaceholder: string
  data: React.ReactNode[][]
  search: string
  currentPage: number
  totalPages: number
  columns: readonly {
    readonly size: 'auto' | 'full'
    readonly children: React.ReactNode
  }[]
}

export default function DataTable({
  queryPlaceholder,
  data,
  columns,
  search: initialSearch,
  currentPage: inititalPage,
  totalPages,
}: DataTableProps) {
  const router = useRouter()

  const [search, setSearch] = React.useState(initialSearch)
  const [page, setPage] = React.useState(inititalPage)

  React.useEffect(() => {
    const controller = new AbortController()

    setTimeout(() => {
      if (controller.signal.aborted) return

      const searchParams = new URLSearchParams()
      if (search) searchParams.set('search', search)
      if (page > 1) searchParams.set('page', page.toString())
      else searchParams.delete('page')

      router.push(`?${searchParams.toString()}`)
    }, QUERY_DEBOUNCE)

    new Promise((res) => setTimeout(res, QUERY_DEBOUNCE)).then()

    return () => controller.abort()
  }, [search, page, router.push])

  const pages = React.useMemo(() => {
    const numberOfSuccessorPages = totalPages - inititalPage

    const previousCount = Math.min(
      2 + Math.max(0, 2 - numberOfSuccessorPages),
      inititalPage - 1,
    )

    const nextCount = Math.min(
      2 + Math.max(0, 3 - inititalPage),
      numberOfSuccessorPages,
    )

    const pages = [
      ...Array.from(
        { length: previousCount },
        (_, i) => inititalPage - previousCount + i,
      ),
      inititalPage,
      ...Array.from({ length: nextCount }, (_, i) => inititalPage + 1 + i),
    ]

    return pages
  }, [inititalPage, totalPages])

  React.useEffect(() => {
    for (const page of pages) {
      router.prefetch(`?page=${page}`)
    }
  }, [pages, router])

  const getColByIdx = (colIdx: number) => {
    const colItems: React.ReactNode[] = []

    for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
      colItems.push(data[rowIdx][colIdx])
    }

    return colItems
  }

  return (
    <div className="space-y-5">
      <nav className="flex w-full gap-6 border-gray-200 border-b pb-2">
        <input
          className="mr-auto w-full max-w-96 border border-gray-200 px-4 py-2"
          onChange={(e) => setSearch(e.target.value)}
          placeholder={queryPlaceholder}
          type="search"
          value={search}
        />

        <div className="flex gap-1">
          {pages.map((idx) => (
            <button
              className={`grid size-10.5 ${idx === inititalPage ? 'border-2 border-gray-950 font-bold' : 'border-gray-200'} place-items-center border p-1 hover:bg-gray-100`}
              key={idx}
              name="page"
              onClick={() => setPage(idx)}
              type="button"
            >
              {idx}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex w-full gap-5 overflow-hidden">
        {/* i really hate me for handling it this way but `table` just doesnt support the layout i need :// */}
        {columns.map((column, idx) => (
          <div
            className={`space-y-5 overflow-hidden ${
              column.size === 'full' ? 'flex-1 shrink-0' : 'flex-initial'
            }`}
            key={`col/${idx.toString()}`}
          >
            <span className="block truncate font-medium text-base text-gray-500 uppercase">
              {column.children}
            </span>

            {getColByIdx(idx).map((cell, idx) => (
              <div
                className="block w-full max-w-full truncate"
                key={`cell/${idx.toString()}`}
              >
                ‎{cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
