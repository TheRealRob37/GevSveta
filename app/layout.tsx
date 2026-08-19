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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <body>{children}</body>
    </html>
  )
}
