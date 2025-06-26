import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Retro Dev Profile',
  description: 'Eine Retro-Style Developer Profilseite',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="bg-black min-h-screen">
        {children}
      </body>
    </html>
  )
} 