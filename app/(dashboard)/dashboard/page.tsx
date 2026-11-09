import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ConnectButton } from '@/components/salesforce/ConnectButton'
import { OrgLimitsCard } from '@/components/salesforce/OrgLimitsCard'
import { signOut } from '@/app/(auth)/login/actions'

// Opt out of prerendering — this page reads Supabase auth on every request
export const dynamic = 'force-dynamic'

interface DashboardPageProps {
  searchParams: Promise<{ connected?: string; error?: string }>
}

export const metadata = {
  title: 'Dashboard — Salesforce Hub',
  description: 'Manage your Salesforce connection and view real-time org metrics.',
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // ── Auth guard (middleware handles redirect, but double-check) ─
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // ── Check Salesforce connection status ─────────────────────────
  const { data: sfCreds } = await supabase
    .from('sf_credentials')
    .select('instance_url, sf_user_id, updated_at')
    .eq('user_id', user.id)
    .single()

  const isConnected   = !!sfCreds
  const params        = await searchParams
  const justConnected = params.connected === 'salesforce'
  const oauthError    = params.error

  return (
    <div className="min-h-dvh bg-[var(--background)]">

      {/* ── Top Nav ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg sf-gradient flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.5 9.5c-.28 0-.54.04-.79.1A7.003 7.003 0 0 0 5.04 11.5 4.5 4.5 0 0 0 4.5 20h15a4.5 4.5 0 0 0 0-9v-.5z"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-[var(--foreground)]">Salesforce Hub</span>
          </div>
          <form action={signOut}>
            <button
              id="signout-btn"
              type="submit"
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Success / Error banners */}
        {justConnected && (
          <div
            role="status"
            className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm animate-[fadeIn_0.4s_ease-out]"
          >
            <span aria-hidden="true">✅</span>
            Salesforce connected successfully!
          </div>
        )}
        {oauthError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <span aria-hidden="true">⚠️</span>
            OAuth error: {oauthError.replace(/_/g, ' ')}
          </div>
        )}

        {/* Welcome card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Hello, {user.email?.split('@')[0] ?? 'there'} 👋
              </h1>
              <p className="text-sm text-[var(--muted)] mt-0.5">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-[var(--muted)]'}`} />
              {isConnected ? 'Salesforce connected' : 'Salesforce not connected'}
            </div>
          </div>
        </div>

        {/* Salesforce Connection card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl sf-gradient flex items-center justify-center shadow-lg shadow-[#0176D3]/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.5 9.5c-.28 0-.54.04-.79.1A7.003 7.003 0 0 0 5.04 11.5 4.5 4.5 0 0 0 4.5 20h15a4.5 4.5 0 0 0 0-9v-.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">Salesforce Integration</h2>
              <p className="text-xs text-[var(--muted)]">
                {isConnected
                  ? `Connected · ${sfCreds?.instance_url ?? ''}`
                  : 'Connect your Salesforce org to get started'
                }
              </p>
            </div>
          </div>

          {isConnected && sfCreds && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[var(--surface-raised)] p-3">
                <p className="text-[var(--muted)] mb-0.5">Instance URL</p>
                <p className="text-[var(--foreground)] font-medium truncate">{sfCreds.instance_url}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-raised)] p-3">
                <p className="text-[var(--muted)] mb-0.5">Last refreshed</p>
                <p className="text-[var(--foreground)] font-medium">
                  {new Date(sfCreds.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <ConnectButton
              isConnected={isConnected}
              onDisconnect={() => window.location.reload()}
            />
          </div>
        </div>

        {/* Org Limits — only shown when connected */}
        {isConnected && (
          <OrgLimitsCard userId={user.id} />
        )}

        {/* Empty state when not connected */}
        {!isConnected && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-raised)] flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-[var(--muted)] text-sm">
              Connect your Salesforce org to view live metrics and data.
            </p>
          </div>
        )}

      </main>
    </div>
  )
}
