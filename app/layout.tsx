import type { Metadata, Viewport } from 'next'
import './globals.css'
import { COUPLE_NAMES, EVENT_TITLE, EVENT_DATE_DISPLAY, VENUE_LOCATION } from '@/lib/constants'

// Vercel sets VERCEL_URL on every deployment — production and previews
// alike — so absolute URLs (OG/Twitter images) always resolve against the
// deployment actually serving the page, rather than a hardcoded domain
// that would be wrong on preview links.
const SITE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const PAGE_TITLE = `Սիրով հրավիրում ենք — ${COUPLE_NAMES}`
const PAGE_DESCRIPTION = `${EVENT_DATE_DISPLAY} • ${VENUE_LOCATION} — ${COUPLE_NAMES} ${EVENT_TITLE.toLowerCase()}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: PAGE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ['/og-image.jpg'],
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
