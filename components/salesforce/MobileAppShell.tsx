'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { SalesforceContact } from '@/lib/salesforce/client'
import type { SalesforceSessionCookie } from '@/lib/salesforce/token'

interface MobileAppShellProps {
  initialSession: SalesforceSessionCookie | null
  oauthError?: string | null
}

const DEMO_CONTACTS: SalesforceContact[] = [
  {
    Id: '003Hu00003pK8QxIAK',
    Name: 'ava.chen@acmecorp.io',
    FirstName: 'Ava',
    LastName: 'Chen',
    Title: 'VP of Revenue Operations',
    Email: 'ava.chen@acmecorp.io',
    Phone: '+1 (415) 890-2311',
  },
  {
    Id: '003Hu00003pK8QyIAK',
    Name: 'Marcus Vance',
    FirstName: 'Marcus',
    LastName: 'Vance',
    Title: 'Enterprise Account Executive',
    Email: 'm.vance@cloudscale.com',
    Phone: '+1 (650) 442-9810',
  },
  {
    Id: '003Hu00003pK8QzIAK',
    Name: 'Elena Rostova',
    FirstName: 'Elena',
    LastName: 'Rostova',
    Title: 'Chief Technology Officer',
    Email: 'elena@novalabs.ai',
    Phone: '+1 (212) 555-0194',
  },
  {
    Id: '003Hu00003pK8R0IAK',
    Name: 'David Nguyen',
    FirstName: 'David',
    LastName: 'Nguyen',
    Title: 'Head of Platform Engineering',
    Email: 'd.nguyen@fintechglobal.io',
    Phone: '+1 (408) 771-3920',
  },
]

// Fix first demo contact's Name to full name
DEMO_CONTACTS[0].Name = 'Ava Chen'

const OAUTH_SCOPES = [
  {
    scope: 'api',
    label: 'REST API Access (v60.0)',
    desc: 'Query and manage CRM Contacts & Accounts via SOQL and SObject endpoints.',
  },
  {
    scope: 'refresh_token · offline_access',
    label: 'Auto Token Renewal',
    desc: 'Automatically refreshes expired access tokens without interrupting your session.',
  },
  {
    scope: 'openid',
    label: 'Organization & User Identity',
    desc: 'Verifies your Salesforce User ID and Organization workspace metadata.',
  },
]

export function MobileAppShell({
  initialSession,
  oauthError,
}: MobileAppShellProps) {
  const [session, setSession] = useState<SalesforceSessionCookie | null>(
    initialSession
  )
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'contacts' | 'security'>('contacts')
  const [contacts, setContacts] = useState<SalesforceContact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'error' | 'success' | 'info'
    text: string
  } | null>(
    oauthError
      ? { type: 'error', text: `OAuth Error: ${oauthError}` }
      : null
  )

  // Modal form state
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isConnected = Boolean(session) || isDemoMode

  // Fallback for browsers that do not natively support <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return
        const rect = dialog.getBoundingClientRect()
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        if (!isDialogContent) {
          dialog.close()
        }
      }
      dialog.addEventListener('click', handleBackdropClick)
      return () => dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [isConnected])

  const fetchContacts = useCallback(async () => {
    if (isDemoMode) {
      setIsLoadingContacts(true)
      await new Promise((r) => setTimeout(r, 350))
      setContacts((prev) => (prev.length > 0 ? prev : DEMO_CONTACTS))
      setIsLoadingContacts(false)
      return
    }

    if (!session) return

    setIsLoadingContacts(true)
    setBannerMessage(null)
    try {
      const res = await fetch('/api/salesforce/contacts', {
        method: 'GET',
        cache: 'no-store',
      })
      const data = (await res.json()) as {
        records?: SalesforceContact[]
        error?: string
      }

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setContacts(data.records ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load contacts'
      setBannerMessage({ type: 'error', text: msg })
    } finally {
      setIsLoadingContacts(false)
    }
  }, [isDemoMode, session])

  useEffect(() => {
    if (!session) return
    let cancelled = false

    fetch('/api/salesforce/contacts', {
      method: 'GET',
      cache: 'no-store',
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          records?: SalesforceContact[]
          error?: string
        }
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`)
        }
        if (!cancelled) {
          setContacts(data.records ?? [])
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'Failed to load contacts'
          setBannerMessage({ type: 'error', text: msg })
        }
      })

    return () => {
      cancelled = true
    }
  }, [session])

  const handleOpenCreateModal = () => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }

  const handleCloseCreateModal = () => {
    const dialog = dialogRef.current
    if (dialog && dialog.open) {
      dialog.close()
    }
  }

  const handleCreateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!lastName.trim()) {
      setBannerMessage({
        type: 'error',
        text: 'Last Name is required to create a Contact.',
      })
      return
    }

    setIsSubmitting(true)
    setBannerMessage(null)

    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 350))
        const fullName = [firstName.trim(), lastName.trim()]
          .filter(Boolean)
          .join(' ')
        const createdDemo: SalesforceContact = {
          Id: `003Demo${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          Name: fullName,
          FirstName: firstName.trim() || null,
          LastName: lastName.trim(),
          Title: title.trim() || null,
          Email: email.trim() || null,
          Phone: phone.trim() || null,
        }
        setContacts((prev) => [createdDemo, ...prev])
        setBannerMessage({
          type: 'success',
          text: `Created Contact "${fullName}" (${createdDemo.Id})`,
        })
      } else {
        const res = await fetch('/api/salesforce/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            FirstName: firstName.trim(),
            LastName: lastName.trim(),
            Title: title.trim(),
            Email: email.trim(),
            Phone: phone.trim(),
          }),
        })
        const data = (await res.json()) as {
          id?: string
          contact?: SalesforceContact
          error?: string
        }

        if (!res.ok || !data.contact) {
          throw new Error(data.error || 'Failed to create Contact')
        }

        setContacts((prev) => [data.contact!, ...prev])
        setBannerMessage({
          type: 'success',
          text: `Contact "${data.contact.Name}" created in Salesforce!`,
        })
      }

      setFirstName('')
      setLastName('')
      setTitle('')
      setEmail('')
      setPhone('')
      handleCloseCreateModal()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not create Contact'
      setBannerMessage({ type: 'error', text: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    setBannerMessage(null)
    try {
      if (isDemoMode) {
        setIsDemoMode(false)
        setContacts([])
        setBannerMessage({
          type: 'info',
          text: 'Exited Demo Workspace. Connect with Salesforce for live Org data.',
        })
        return
      }

      const res = await fetch('/api/auth/salesforce/disconnect', {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error('Failed to revoke Salesforce token')
      }
      setSession(null)
      setContacts([])
      setBannerMessage({
        type: 'info',
        text: 'Salesforce token revoked and removed from Supabase.',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Disconnect failed'
      setBannerMessage({ type: 'error', text: msg })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleEnterDemo = () => {
    setBannerMessage({
      type: 'info',
      text: 'Demo Workspace active — simulating Salesforce REST v60.0 & Supabase sf_tokens.',
    })
    setContacts(DEMO_CONTACTS)
    setIsDemoMode(true)
  }

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.Name?.toLowerCase().includes(q) ||
      c.Email?.toLowerCase().includes(q) ||
      c.Title?.toLowerCase().includes(q) ||
      c.Phone?.toLowerCase().includes(q)
    )
  })

  const orgDisplayName = session?.instanceUrl
    ? session.instanceUrl.replace(/^https?:\/\//, '')
    : isDemoMode
      ? 'acme-dev-ed.my.salesforce.com'
      : 'Salesforce Org'

  const userDisplayName =
    session?.displayName ||
    (isDemoMode ? 'Admin User (Demo Org)' : 'Salesforce User')

  return (
    <div className="min-h-dvh w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center">
      {/* Mobile-First Container (max-w-md mx-auto) */}
      <div className="w-full max-w-md mx-auto min-h-dvh flex flex-col border-x border-[var(--border)] bg-[var(--surface)] shadow-2xl relative pb-24">
        {/* Top App Bar / Status Header */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-[var(--surface)]/90 border-b border-[var(--border)] px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl sf-gradient flex items-center justify-center shadow-md shadow-[#0176D3]/25 shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.5 9.5c-.28 0-.54.04-.79.1A7.003 7.003 0 0 0 5.04 11.5 4.5 4.5 0 0 0 4.5 20h15a4.5 4.5 0 0 0 0-9v-.5z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight truncate">
                    {isConnected ? userDisplayName : 'Salesforce Mobile CRM'}
                  </h1>
                </div>
                <p className="text-xs text-[var(--muted)] truncate font-mono">
                  {isConnected
                    ? orgDisplayName
                    : 'OAuth 2.0 PKCE · Supabase RLS'}
                </p>
              </div>
            </div>

            {/* Connection Status Badge */}
            {isConnected ? (
              <span
                id="connection-status-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isDemoMode ? 'Demo Connected' : 'Connected'}
              </span>
            ) : (
              <span
                id="connection-status-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--border)] shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Disconnected
              </span>
            )}
          </div>
        </header>

        {/* Status / Notification Banner */}
        {bannerMessage && (
          <div
            role="status"
            className={`mx-4 mt-3 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-start justify-between gap-2 border ${
              bannerMessage.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : bannerMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-[#0176D3]/10 border-[#0176D3]/30 text-[#1B96FF]'
            }`}
          >
            <span className="leading-relaxed">{bannerMessage.text}</span>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="text-current opacity-70 hover:opacity-100 px-1"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-4 pb-6 flex flex-col">
          {!isConnected ? (
            /* ── UNAUTHENTICATED VIEW ───────────────────────────── */
            <div className="flex-1 flex flex-col justify-between gap-6">
              <div className="space-y-5">
                {/* Hero Card */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/60 p-5 text-center space-y-3 relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl sf-gradient mx-auto flex items-center justify-center shadow-lg shadow-[#0176D3]/30">
                    <svg
                      className="w-8 h-8 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19.5 9.5c-.28 0-.54.04-.79.1A7.003 7.003 0 0 0 5.04 11.5 4.5 4.5 0 0 0 4.5 20h15a4.5 4.5 0 0 0 0-9v-.5z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Connect Your Salesforce Org
                  </h2>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Authenticate via Salesforce OAuth 2.0 Web Server Flow with
                    PKCE (S256). Tokens are encrypted with AES-256-GCM and
                    stored in Supabase <code className="font-mono text-[#1B96FF]">sf_tokens</code>.
                  </p>

                  {/* Primary CTA: Connect with Salesforce */}
                  <div className="pt-2 space-y-2.5">
                    <a
                      id="connect-salesforce-btn"
                      href="/api/auth/salesforce"
                      className="w-full py-3 px-4 rounded-xl sf-gradient text-white font-semibold text-sm shadow-lg shadow-[#0176D3]/25 hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M19.5 9.5c-.28 0-.54.04-.79.1A7.003 7.003 0 0 0 5.04 11.5 4.5 4.5 0 0 0 4.5 20h15a4.5 4.5 0 0 0 0-9v-.5z" />
                      </svg>
                      Connect with Salesforce
                    </a>

                    <button
                      id="preview-connected-demo-btn"
                      type="button"
                      onClick={handleEnterDemo}
                      className="w-full py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[#0176D3]/50 text-xs font-semibold text-[var(--foreground)] transition flex items-center justify-center gap-1.5"
                    >
                      <span>⚡</span>
                      Preview Connected Workspace (Demo Mode)
                    </button>
                  </div>
                </div>

                {/* Requested Permissions Breakdown */}
                <section aria-labelledby="permissions-heading" className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3
                      id="permissions-heading"
                      className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]"
                    >
                      Requested OAuth2 Scopes
                    </h3>
                    <span className="text-[11px] font-mono text-[#1B96FF]">
                      PKCE S256
                    </span>
                  </div>

                  <div className="space-y-2">
                    {OAUTH_SCOPES.map((item) => (
                      <div
                        key={item.scope}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-3 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#0176D3]/15 text-[#1B96FF] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[var(--foreground)]">
                              {item.label}
                            </p>
                            <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] text-[#1B96FF] border border-[var(--border)] shrink-0">
                              {item.scope}
                            </code>
                          </div>
                          <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            /* ── AUTHENTICATED / CONNECTED VIEW ─────────────────── */
            <div className="flex-1 flex flex-col gap-4">
              {/* Organization & Token Bar */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/50 p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                    Active Salesforce Instance
                  </p>
                  <p className="text-xs font-mono font-semibold text-[#1B96FF] truncate mt-0.5">
                    {orgDisplayName}
                  </p>
                </div>
                <button
                  id="disconnect-salesforce-btn"
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 transition shrink-0"
                >
                  {isDisconnecting
                    ? 'Revoking...'
                    : 'Disconnect / Revoke Token'}
                </button>
              </div>

              {activeTab === 'contacts' ? (
                <>
                  {/* Contacts Toolbar: Search + Pull-to-refresh / Refresh Button */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="search-contacts-input"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter contacts by name, title, email..."
                        aria-label="Filter contacts"
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 pl-3 pr-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#0176D3]"
                      />
                    </div>
                    <button
                      id="refresh-contacts-btn"
                      type="button"
                      onClick={() => void fetchContacts()}
                      disabled={isLoadingContacts}
                      className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/60 hover:border-[#0176D3]/50 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition disabled:opacity-50"
                      aria-label="Refresh Contacts"
                    >
                      <span
                        className={`inline-block ${
                          isLoadingContacts ? 'animate-spin' : ''
                        }`}
                      >
                        ↻
                      </span>
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* SOQL Query indicator */}
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted)] px-1">
                    <span>
                      Recent Contacts ({filteredContacts.length})
                    </span>
                    <code className="font-mono text-[10px] text-[#1B96FF]">
                      REST v60.0 · LIMIT 10
                    </code>
                  </div>

                  {/* Contacts List */}
                  {isLoadingContacts ? (
                    <div className="space-y-2.5" aria-busy="true">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-20 rounded-2xl border border-[var(--border)] skeleton"
                        />
                      ))}
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/30 p-8 text-center space-y-2">
                      <p className="text-sm font-semibold">No Contacts Found</p>
                      <p className="text-xs text-[var(--muted)]">
                        Tap the + button below to create your first Salesforce
                        Contact record.
                      </p>
                    </div>
                  ) : (
                    <ul id="contacts-list" className="space-y-2.5">
                      {filteredContacts.map((contact) => {
                        const initials = (contact.Name || 'SF')
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()

                        return (
                          <li
                            key={contact.Id}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 hover:border-[#0176D3]/40 p-3.5 transition"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl sf-gradient text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="text-sm font-semibold truncate">
                                    {contact.Name}
                                  </h3>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] shrink-0">
                                    {contact.Id.slice(0, 10)}…
                                  </span>
                                </div>
                                <p className="text-xs text-[#1B96FF] font-medium truncate mt-0.5">
                                  {contact.Title || 'No Title Specified'}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
                                  {contact.Email && (
                                    <span className="truncate">
                                      ✉️ {contact.Email}
                                    </span>
                                  )}
                                  {contact.Phone && (
                                    <span className="truncate">
                                      📞 {contact.Phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </>
              ) : (
                /* ── SECURITY / TOKEN DETAILS TAB ───────────────── */
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/40 p-4 space-y-3 text-xs">
                  <h2 className="text-sm font-bold">
                    OAuth2 & Supabase Token Status
                  </h2>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                      <span className="text-[var(--muted)]">Salesforce User</span>
                      <span>
                        {session?.salesforceUserId || '005Hu00000DemoUser'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                      <span className="text-[var(--muted)]">Supabase Table</span>
                      <span className="text-emerald-400">public.sf_tokens</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                      <span className="text-[var(--muted)]">REST API</span>
                      <span className="text-[#1B96FF]">v60.0</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[var(--muted)]">Auto-Refresh</span>
                      <span className="text-emerald-400">
                        Active (on 401 Unauthorized)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating Action Button (FAB) — visible when connected */}
        {isConnected && (
          <button
            id="fab-create-contact-btn"
            type="button"
            onClick={handleOpenCreateModal}
            aria-label="Create new Salesforce Contact"
            className="fixed bottom-20 right-[max(1rem,calc(50vw-13rem))] z-30 w-13 h-13 rounded-2xl sf-gradient text-white shadow-xl shadow-[#0176D3]/40 hover:scale-105 active:scale-95 transition flex items-center justify-center text-2xl font-bold"
          >
            +
          </button>
        )}

        {/* Native <dialog closedby="any"> Modal Form for Quick Contact Creation */}
        <dialog
          ref={dialogRef}
          id="create-contact-dialog"
          closedby="any"
          aria-labelledby="create-contact-title"
          className="w-[calc(100%-2rem)] max-w-sm m-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] p-0 shadow-2xl"
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h2 id="create-contact-title" className="text-base font-bold">
                  New Salesforce Contact
                </h2>
                <p className="text-[11px] text-[var(--muted)]">
                  POST /services/data/v60.0/sobjects/Contact
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                aria-label="Close modal"
                className="w-7 h-7 rounded-lg border border-[var(--border)] text-xs flex items-center justify-center hover:bg-[var(--surface-raised)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="contact-first-name"
                    className="block text-[11px] font-semibold text-[var(--muted)] mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="contact-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ava"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs focus:outline-none focus:border-[#0176D3]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-last-name"
                    className="block text-[11px] font-semibold text-[var(--muted)] mb-1"
                  >
                    Last Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Chen"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs focus:outline-none focus:border-[#0176D3]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-title"
                  className="block text-[11px] font-semibold text-[var(--muted)] mb-1"
                >
                  Job Title
                </label>
                <input
                  id="contact-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VP of Engineering"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs focus:outline-none focus:border-[#0176D3]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-[11px] font-semibold text-[var(--muted)] mb-1"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ava.chen@company.com"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs focus:outline-none focus:border-[#0176D3]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-[11px] font-semibold text-[var(--muted)] mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (415) 555-0199"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs focus:outline-none focus:border-[#0176D3]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-3.5 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface-raised)]"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-contact-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl sf-gradient text-white text-xs font-semibold shadow-md shadow-[#0176D3]/25 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Fixed Bottom Navigation Bar (max-w-md mx-auto) */}
        <nav
          aria-label="Mobile bottom navigation"
          className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl px-4 py-2 flex items-center justify-around"
        >
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold transition ${
              activeTab === 'contacts'
                ? 'text-[#1B96FF]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <span className="text-base" aria-hidden="true">
              👥
            </span>
            <span>Contacts</span>
          </button>

          {isConnected ? (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold text-[var(--muted)] hover:text-[#1B96FF] transition"
            >
              <span className="text-base" aria-hidden="true">
                ➕
              </span>
              <span>New Contact</span>
            </button>
          ) : (
            <a
              href="/api/auth/salesforce"
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold text-[var(--muted)] hover:text-[#1B96FF] transition"
            >
              <span className="text-base" aria-hidden="true">
                🔗
              </span>
              <span>Connect</span>
            </a>
          )}

          <button
            type="button"
            onClick={() =>
              isConnected ? setActiveTab('security') : handleEnterDemo()
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold transition ${
              activeTab === 'security' && isConnected
                ? 'text-[#1B96FF]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <span className="text-base" aria-hidden="true">
              🛡️
            </span>
            <span>{isConnected ? 'Token Status' : 'Demo Mode'}</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
