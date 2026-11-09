'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface LimitItem {
  Max:       number
  Remaining: number
}

interface OrgLimitsData {
  DailyApiRequests:     LimitItem
  DataStorageMB?:       LimitItem
  FileStorageMB?:       LimitItem
  [key: string]:        LimitItem | undefined
}

interface OrgLimitsCardProps {
  userId: string
}

/**
 * Fetches and displays Salesforce Org API limits with animated progress bars.
 * Pulls data from /api/salesforce/limits (a server-side proxy endpoint).
 */
export function OrgLimitsCard({ userId }: OrgLimitsCardProps) {
  const [limits, setLimits]   = useState<OrgLimitsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    async function fetchLimits() {
      try {
        const res = await fetch('/api/salesforce/limits')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setLimits(data)
      } catch (err) {
        setError('Failed to load org limits')
        console.error('[OrgLimitsCard]', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLimits()
  }, [userId])

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex items-center justify-center min-h-[160px]">
        <LoadingSpinner size="lg" label="Loading org limits..." />
      </div>
    )
  }

  if (error || !limits) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
        <p className="text-red-400 text-sm">{error ?? 'No data available'}</p>
      </div>
    )
  }

  const highlight: Array<{ key: keyof OrgLimitsData; label: string; color: string }> = [
    { key: 'DailyApiRequests', label: 'Daily API Requests', color: '#0176D3' },
    { key: 'DataStorageMB',    label: 'Data Storage (MB)',  color: '#06A59A' },
    { key: 'FileStorageMB',    label: 'File Storage (MB)',  color: '#4C6EF5' },
  ]

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg sf-gradient flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="font-semibold text-[var(--foreground)]">Org Limits</h3>
      </div>

      {highlight.map(({ key, label, color }) => {
        const item = limits[key]
        if (!item) return null
        const used     = item.Max - item.Remaining
        const pct      = item.Max > 0 ? Math.round((used / item.Max) * 100) : 0
        const isHigh   = pct >= 80
        const barColor = isHigh ? '#ef4444' : color

        return (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--muted)] font-medium">{label}</span>
              <span className={`font-semibold ${isHigh ? 'text-red-400' : 'text-[var(--foreground)]'}`}>
                {used.toLocaleString()} / {item.Max.toLocaleString()}
                <span className="text-[var(--muted)] font-normal ml-1">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--surface-raised)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, background: barColor }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${pct}% used`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
