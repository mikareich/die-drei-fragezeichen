import './globals.css'

import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import type React from 'react'
import { transferCoverToBucket } from '~/actions/cover'
import NavBar from '~/components/NavBar'
import Provider from '~/components/Provider'

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Die Drei Fragezeichen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  transferCoverToBucket(1)

  return (
    <html lang="de">
      <body
        className={`${geistMono.variable} min-h-screen w-screen overflow-x-hidden font-mono text-gray-700 antialiased`}
      >
        <div className="container mx-auto flex flex-col gap-10 px-4 py-10">
          <Provider>
            <NavBar />

            {children}
          </Provider>
        </div>
      </body>
    </html>
  )
}
