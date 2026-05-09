import './globals.css'
import { Geist_Mono } from 'next/font/google'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

type RootLayoutProps = { children: React.ReactNode }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de" className={`${geistMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
