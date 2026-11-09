import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Salesforce Hub — OAuth2 + Supabase',
    template: '%s — Salesforce Hub',
  },
  description:
    'A secure Salesforce OAuth2 integration platform built with Next.js 15, Supabase Auth, and Tailwind CSS v4.',
  keywords: ['Salesforce', 'OAuth2', 'Supabase', 'Next.js', 'CRM', 'Integration'],
  authors: [{ name: 'Salesforce Hub' }],
  robots: 'noindex, nofollow', // private internal tool
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
