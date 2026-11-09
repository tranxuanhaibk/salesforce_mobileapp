import { getValidSalesforceClient, type SalesforceClient } from './client'

// ── Types ─────────────────────────────────────────────────────────

export interface OrgLimits {
  DailyApiRequests: {
    Max:       number
    Remaining: number
  }
  DailyBulkV2QueryJobs?: {
    Max:       number
    Remaining: number
  }
  [key: string]: { Max: number; Remaining: number } | undefined
}

export interface SalesforceUserInfo {
  sub:                string
  name:               string
  email:              string
  given_name:         string
  family_name:        string
  picture?:           string
  organization_id:    string
  preferred_username: string
  locale:             string
  timezone:           string
  zoneinfo:           string
  updated_at:         string
  is_app_installed:   boolean
}

export interface SOQLResult<T> {
  totalSize: number
  done:      boolean
  records:   T[]
}

// ── Internal fetch helper ─────────────────────────────────────────

async function sfFetch<T>(
  sf:     SalesforceClient,
  path:   string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${sf.instanceUrl}/services/data/${sf.apiVersion}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization:  `Bearer ${sf.accessToken}`,
      'Content-Type': 'application/json',
      Accept:         'application/json',
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[SF API] ${res.status} ${res.statusText}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ── Public API Functions ──────────────────────────────────────────

/**
 * Retrieves current user info from the Salesforce OpenID Connect userinfo endpoint.
 */
export async function getSalesforceUserInfo(userId: string): Promise<SalesforceUserInfo> {
  const sf = await getValidSalesforceClient(userId)
  const loginUrl = process.env.SF_LOGIN_URL ?? 'https://login.salesforce.com'

  const res = await fetch(`${loginUrl}/services/oauth2/userinfo`, {
    headers: {
      Authorization: `Bearer ${sf.accessToken}`,
      Accept:        'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`[SF API] Failed to fetch userinfo: ${res.status}`)
  }

  return res.json()
}

/**
 * Fetches the current org's API usage limits.
 * Great for displaying a "quota" widget in the dashboard.
 */
export async function getOrgLimits(userId: string): Promise<OrgLimits> {
  const sf = await getValidSalesforceClient(userId)
  return sfFetch<OrgLimits>(sf, '/limits')
}

/**
 * Executes a SOQL query and returns the result set.
 *
 * @example
 * const result = await querySObjects<{ Id: string; Name: string }>(
 *   userId,
 *   "SELECT Id, Name FROM Account LIMIT 10"
 * )
 */
export async function querySObjects<T>(
  userId: string,
  soql:   string
): Promise<SOQLResult<T>> {
  const sf     = await getValidSalesforceClient(userId)
  const query  = encodeURIComponent(soql)
  return sfFetch<SOQLResult<T>>(sf, `/query?q=${query}`)
}

/**
 * Describes all sObject types available in the org.
 */
export async function describeGlobal(userId: string) {
  const sf = await getValidSalesforceClient(userId)
  return sfFetch<{ sobjects: { name: string; label: string; queryable: boolean }[] }>(
    sf,
    '/sobjects'
  )
}
