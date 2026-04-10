import React from 'react'
import './globals.css'

export const metadata = {
  title: 'Campus Platform',
  description: 'Flächenmanagement Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}
