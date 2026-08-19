import type { Metadata, Viewport } from 'next'
import './globals.css'
import { COUPLE_NAMES, EVENT_TITLE, EVENT_DATE_DISPLAY } from '@/lib/constants'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: `${COUPLE_NAMES} — ${EVENT_TITLE}`,
  description: `${EVENT_DATE_DISPLAY} — ${COUPLE_NAMES} նշանադրության հանդիսավոր միջոցառում`,
  openGraph: {
    title: `${COUPLE_NAMES} — ${EVENT_TITLE}`,
    description: 'Սիրով հրավիրում ենք կիսել մեր կյանքի ամենաերջանիկ օրը',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <body>{children}</body>
    </html>
  )
}
