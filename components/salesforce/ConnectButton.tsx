'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ConnectButtonProps {
  isConnected: boolean
  onDisconnect?: () => void
}

/**
 * Salesforce Connect / Disconnect button.
 *
 * - "Connect Salesforce" → navigates to /api/auth/salesforce (initiates OAuth)
 * - "Disconnect"        → calls POST /api/auth/salesforce/disconnect
 */
export function ConnectButton({ isConnected, onDisconnect }: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleDisconnect() {
    if (!confirm('Disconnect your Salesforce account? You can reconnect anytime.')) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/salesforce/disconnect', { method: 'POST' })
      if (!res.ok) throw new Error('Disconnect failed')
      onDisconnect?.()
    } catch (err) {
      console.error(err)
      alert('Failed to disconnect. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleConnect() {
    setIsLoading(true)
    router.push('/api/auth/salesforce')
  }

  if (isConnected) {
    return (
      <button
        id="sf-disconnect-btn"
        onClick={handleDisconnect}
        disabled={isLoading}
        className="
          group flex items-center gap-2 px-4 py-2 rounded-lg
          border border-red-500/40 text-red-400
          hover:bg-red-500/10 hover:border-red-400
          transition-all duration-200 text-sm font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isLoading ? (
          <LoadingSpinner size="sm" color="text-red-400" label="Disconnecting..." />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
        {isLoading ? 'Disconnecting…' : 'Disconnect'}
      </button>
    )
  }

  return (
    <button
      id="sf-connect-btn"
      onClick={handleConnect}
      disabled={isLoading}
      className="
        group relative flex items-center gap-3 px-6 py-3 rounded-xl
        text-white font-semibold text-sm
        bg-gradient-to-r from-[#0176D3] to-[#014486]
        hover:from-[#1B96FF] hover:to-[#0176D3]
        shadow-lg shadow-[#0176D3]/25
        hover:shadow-xl hover:shadow-[#0176D3]/40
        hover:-translate-y-0.5
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
      "
    >
      {isLoading ? (
        <LoadingSpinner size="sm" color="text-white" label="Connecting to Salesforce..." />
      ) : (
        /* Salesforce cloud icon */
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.5 9.5c-.28 0-.54.04-.79.1A7.003 7.003 0 0 0 5.04 11.5 4.5 4.5 0 0 0 4.5 20h15a4.5 4.5 0 0 0 0-9v-.5z"/>
        </svg>
      )}
      {isLoading ? 'Connecting…' : 'Connect Salesforce'}
    </button>
  )
}
