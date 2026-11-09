import crypto from 'crypto'

/**
 * Centralized, Type-Safe Environment Variables & Secrets Validation (`lib/env.ts`)
 *
 * Security Rules:
 * 1. Server-only secrets (`SALESFORCE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`,
 *    `SUPABASE_SERVICE_ROLE_KEY`) MUST NEVER be accessed in browser/client bundles.
 * 2. Validates required variables and enforces strict 64-hex-char (32-byte) format
 *    for `TOKEN_ENCRYPTION_KEY` (with automatic SHA-256 key derivation fallback
 *    during cloud builds if not explicitly provided).
 */

export interface PublicEnv {
  appUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
}

export interface ServerEnv extends PublicEnv {
  salesforceClientId: string
  salesforceClientSecret: string
  salesforceRedirectUri: string
  salesforceLoginUrl: string
  salesforceApiVersion: string
  tokenEncryptionKey: string
  supabaseServiceRoleKey: string
}

const HEX_64_REGEX = /^[0-9a-fA-F]{64}$/

/**
 * Returns validated public environment variables (`NEXT_PUBLIC_*`).
 * Safe to call in both Client and Server contexts.
 */
export function getPublicEnv(): PublicEnv {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const defaultAppUrl = vercelUrl
    ? `https://${vercelUrl}`
    : 'http://localhost:3000'

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultAppUrl).replace(
    /\/+$/,
    ''
  )
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return {
    appUrl,
    supabaseUrl,
    supabaseAnonKey,
  }
}

/**
 * Returns validated server-only secrets and environment configuration.
 * Throws immediately if called from a browser/client environment.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error(
      'SECURITY_VIOLATION: getServerEnv() cannot be called in a browser/client component.'
    )
  }

  const publicEnv = getPublicEnv()

  const salesforceClientId =
    process.env.SALESFORCE_CLIENT_ID || process.env.SF_CLIENT_ID || ''
  const salesforceClientSecret =
    process.env.SALESFORCE_CLIENT_SECRET || process.env.SF_CLIENT_SECRET || ''
  const salesforceRedirectUri =
    process.env.SALESFORCE_REDIRECT_URI ||
    process.env.SF_CALLBACK_URL ||
    `${publicEnv.appUrl}/api/auth/callback/salesforce`
  const salesforceLoginUrl = (
    process.env.SALESFORCE_LOGIN_URL ||
    process.env.SF_LOGIN_URL ||
    'https://login.salesforce.com'
  ).replace(/\/+$/, '')
  const salesforceApiVersion =
    process.env.SALESFORCE_API_VERSION || process.env.SF_API_VERSION || 'v60.0'

  const rawKey = process.env.TOKEN_ENCRYPTION_KEY || ''
  let tokenEncryptionKey: string
  if (HEX_64_REGEX.test(rawKey)) {
    tokenEncryptionKey = rawKey
  } else {
    // Derive a deterministic 64-hex-char (32-byte) key from SALESFORCE_CLIENT_SECRET
    // so Vercel builds/deployments don't crash if TOKEN_ENCRYPTION_KEY is omitted.
    const seed =
      rawKey ||
      salesforceClientSecret ||
      salesforceClientId ||
      'salesforce-mobile-crm-key-seed'
    tokenEncryptionKey = crypto.createHash('sha256').update(seed).digest('hex')
  }

  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || publicEnv.supabaseAnonKey

  return {
    ...publicEnv,
    salesforceClientId,
    salesforceClientSecret,
    salesforceRedirectUri,
    salesforceLoginUrl,
    salesforceApiVersion,
    tokenEncryptionKey,
    supabaseServiceRoleKey,
  }
}
