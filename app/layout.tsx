import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const _jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'Neural Network Arena',
  description: 'An interactive neural network training game for AI/ML scientists',
}

export const viewport: Viewport = {
  themeColor: '#0a0f14',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_spaceGrotesk.variable} ${_jetBrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
