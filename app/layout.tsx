import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, DM_Mono } from 'next/font/google'
import '@/src/styles.css'
import './font-overrides.css'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Relic Signal', template: '%s · Relic Signal' },
  description: 'Live Warframe relic prices, reward probabilities, and Origin System world-state intelligence.',
  applicationName: 'Relic Signal',
  openGraph: { title: 'Relic Signal', description: 'Live Warframe relic and market intelligence.', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Relic Signal', description: 'Live Warframe relic and market intelligence.' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#090c0e' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${mono.variable}`}><body>{children}</body></html>
}
