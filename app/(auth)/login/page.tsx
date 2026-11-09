'use client'

import { useState, useTransition } from 'react'
import { signInWithEmail, signInWithMagicLink } from './actions'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type Tab = 'password' | 'magic'

export default function LoginPage() {
  const [tab, setTab]             = useState<Tab>('password')
  const [error, setError]         = useState<string | null>(null)
  const [successMsg, setSuccess]  = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signInWithEmail(data)
      if (result?.error) setError(result.error)
    })
  }

  function handleMagicSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signInWithMagicLink(data)
      if (result?.error)   setError(result.error)
      if (result?.success) setSuccess(result.message ?? 'Check your email!')
    })
  }

  return (
    <main className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-[var(--background)]">

      {/* ── Animated Background ─────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large blurred orbs for depth */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #0176D3, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #4C6EF5, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #06A59A, transparent)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#0176D3 1px, transparent 1px), linear-gradient(90deg, #0176D3 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
      </div>

      {/* ── Login Card ──────────────────────────────────────── */}
      <div
        className="relative w-full max-w-md mx-4 animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        style={{ animationFillMode: 'both' }}
      >
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/20">

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl sf-gradient shadow-lg shadow-[#0176D3]/30 mb-4">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.5 9.5c-.28 0-.54.04-.79.1A7.003 7.003 0 0 0 5.04 11.5 4.5 4.5 0 0 0 4.5 20h15a4.5 4.5 0 0 0 0-9v-.5z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Welcome back
            </h1>
            <p className="text-[var(--muted)] text-sm mt-1">
              Sign in to your Salesforce hub
            </p>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Sign-in method"
            className="flex rounded-xl overflow-hidden border border-[var(--border)] mb-6 bg-[var(--surface-raised)]"
          >
            {(['password', 'magic'] as Tab[]).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                role="tab"
                aria-selected={tab === t}
                aria-controls={`panel-${t}`}
                onClick={() => { setTab(t); setError(null); setSuccess(null) }}
                className={`
                  flex-1 py-2.5 text-sm font-medium transition-all duration-200
                  ${tab === t
                    ? 'bg-[#0176D3] text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }
                `}
              >
                {t === 'password' ? '🔑 Password' : '✨ Magic Link'}
              </button>
            ))}
          </div>

          {/* Error / Success Alert */}
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              📬 {successMsg}
            </div>
          )}

          {/* Password Tab Panel */}
          <div
            id="panel-password"
            role="tabpanel"
            aria-labelledby="tab-password"
            hidden={tab !== 'password'}
          >
            <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  className="
                    w-full px-4 py-2.5 rounded-xl text-sm
                    bg-[var(--surface-raised)] border border-[var(--border)]
                    text-[var(--foreground)] placeholder:text-[var(--muted)]
                    focus:outline-none focus:border-[#0176D3] focus:ring-2 focus:ring-[#0176D3]/20
                    transition-all duration-200
                  "
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="
                    w-full px-4 py-2.5 rounded-xl text-sm
                    bg-[var(--surface-raised)] border border-[var(--border)]
                    text-[var(--foreground)] placeholder:text-[var(--muted)]
                    focus:outline-none focus:border-[#0176D3] focus:ring-2 focus:ring-[#0176D3]/20
                    transition-all duration-200
                  "
                />
              </div>
              <button
                id="signin-password-btn"
                type="submit"
                disabled={isPending}
                className="
                  w-full flex items-center justify-center gap-2
                  py-2.5 px-4 rounded-xl font-semibold text-sm text-white
                  sf-gradient hover:opacity-90
                  shadow-lg shadow-[#0176D3]/20
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isPending ? <LoadingSpinner size="sm" color="text-white" label="Signing in..." /> : null}
                {isPending ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          {/* Magic Link Tab Panel */}
          <div
            id="panel-magic"
            role="tabpanel"
            aria-labelledby="tab-magic"
            hidden={tab !== 'magic'}
          >
            <form onSubmit={handleMagicSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="magic-email" className="block text-sm font-medium text-[var(--foreground)]">
                  Email
                </label>
                <input
                  id="magic-email"
                  name="magic-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  className="
                    w-full px-4 py-2.5 rounded-xl text-sm
                    bg-[var(--surface-raised)] border border-[var(--border)]
                    text-[var(--foreground)] placeholder:text-[var(--muted)]
                    focus:outline-none focus:border-[#0176D3] focus:ring-2 focus:ring-[#0176D3]/20
                    transition-all duration-200
                  "
                />
              </div>
              <p className="text-xs text-[var(--muted)]">
                We&apos;ll send you a one-time login link — no password needed.
              </p>
              <button
                id="signin-magic-btn"
                type="submit"
                disabled={isPending}
                className="
                  w-full flex items-center justify-center gap-2
                  py-2.5 px-4 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-[#4C6EF5] to-[#06A59A]
                  hover:opacity-90 shadow-lg shadow-[#4C6EF5]/20
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isPending ? <LoadingSpinner size="sm" color="text-white" label="Sending magic link..." /> : null}
                {isPending ? 'Sending…' : '✨ Send Magic Link'}
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted)] mt-4">
          Secured by{' '}
          <span className="text-[#0176D3] font-medium">Supabase Auth</span>
          {' '}+{' '}
          <span className="text-[#0176D3] font-medium">Salesforce OAuth2 PKCE</span>
        </p>
      </div>
    </main>
  )
}
