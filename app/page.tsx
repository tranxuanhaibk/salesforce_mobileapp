import type { Metadata } from 'next'
import { getSalesforceSession } from '@/lib/salesforce/token'
import { MobileAppShell } from '@/components/salesforce/MobileAppShell'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Salesforce Mobile CRM — OAuth2 PKCE & Supabase',
  description:
    'Mobile-first Salesforce OAuth2 Web Server Flow with PKCE, Supabase token management, and Contacts REST API v60.0.',
}

interface HomePageProps {
  searchParams: Promise<{ error?: string; connected?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getSalesforceSession()
  const resolvedParams = await searchParams
  const oauthError = resolvedParams?.error ?? null

  return (
    <MobileAppShell
      initialSession={session}
      oauthError={oauthError}
    />
  )
}
