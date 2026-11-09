import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { createServiceRoleClient, type SfTokenRecord } from '@/lib/supabase/server'
import { decrypt, encrypt } from '@/lib/crypto'
import { getPublicEnv, getServerEnv } from '@/lib/env'

export const SF_SESSION_COOKIE = 'sf_session'
export const SF_API_VERSION = 'v60.0'

const LOCAL_TOKEN_STORE_PATH = path.join(process.cwd(), '.next', 'sf_tokens_local.json')

export interface SalesforceEnvConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  loginUrl: string
  encryptionKey: string
}

export function getSalesforceEnv(): SalesforceEnvConfig {
  const env = getServerEnv()
  return {
    clientId: env.salesforceClientId,
    clientSecret: env.salesforceClientSecret,
    redirectUri: env.salesforceRedirectUri,
    loginUrl: env.salesforceLoginUrl,
    encryptionKey: env.tokenEncryptionKey,
  }
}

export function isSupabaseConfigured(): boolean {
  const { supabaseUrl } = getPublicEnv()
  return Boolean(supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co'))
}

function readLocalTokenStore(): Record<string, SfTokenRecord> {
  try {
    if (!fs.existsSync(LOCAL_TOKEN_STORE_PATH)) return {}
    return JSON.parse(fs.readFileSync(LOCAL_TOKEN_STORE_PATH, 'utf8')) as Record<
      string,
      SfTokenRecord
    >
  } catch {
    return {}
  }
}

function writeLocalTokenStore(store: Record<string, SfTokenRecord>): void {
  try {
    const dir = path.dirname(LOCAL_TOKEN_STORE_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(LOCAL_TOKEN_STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
  } catch {
    // Ignore local cache write errors
  }
}

export function saveLocalTokenFallback(record: SfTokenRecord): void {
  const store = readLocalTokenStore()
  store[record.salesforce_user_id] = record
  writeLocalTokenStore(store)
}

export function getLocalTokenFallback(salesforceUserId: string): SfTokenRecord | null {
  const store = readLocalTokenStore()
  return store[salesforceUserId] ?? null
}

export function deleteLocalTokenFallback(salesforceUserId: string): void {
  const store = readLocalTokenStore()
  delete store[salesforceUserId]
  writeLocalTokenStore(store)
}

export interface SalesforceSessionCookie {
  salesforceUserId: string
  instanceUrl: string
  orgId?: string
  displayName?: string
  username?: string
  issuedAt: string
}

export interface ValidSalesforceToken {
  accessToken: string
  instanceUrl: string
  salesforceUserId: string
}

/**
 * Encrypts a token using AES-256-GCM with the validated server encryption key.
 */
export function sealToken(token: string): string {
  const { encryptionKey } = getSalesforceEnv()
  return encrypt(token, encryptionKey)
}

/**
 * Decrypts a stored token if it matches the "iv:authTag:ciphertext" format,
 * otherwise returns it as-is (supports both encrypted and raw tokens in sf_tokens).
 */
export function unsealToken(storedToken: string): string {
  const { encryptionKey } = getSalesforceEnv()
  if (storedToken.split(':').length === 3) {
    return decrypt(storedToken, encryptionKey)
  }
  return storedToken
}

/**
 * Reads and decrypts the active Salesforce session from the httpOnly cookie.
 */
export async function getSalesforceSession(): Promise<SalesforceSessionCookie | null> {
  try {
    const cookieStore = await cookies()
    const rawCookie = cookieStore.get(SF_SESSION_COOKIE)?.value
    if (!rawCookie) return null

    const { encryptionKey } = getSalesforceEnv()
    const jsonStr = decrypt(rawCookie, encryptionKey)
    return JSON.parse(jsonStr) as SalesforceSessionCookie
  } catch {
    return null
  }
}

/**
 * Serializes and encrypts the Salesforce session payload for cookie storage.
 */
export function encodeSalesforceSession(session: SalesforceSessionCookie): string {
  const { encryptionKey } = getSalesforceEnv()
  return encrypt(JSON.stringify(session), encryptionKey)
}

async function fetchStoredTokenRecord(
  salesforceUserId: string
): Promise<SfTokenRecord | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabaseAdmin = createServiceRoleClient()
      const { data, error } = await supabaseAdmin
        .from('sf_tokens')
        .select('*')
        .eq('salesforce_user_id', salesforceUserId)
        .single<SfTokenRecord>()
      if (!error && data) return data
    } catch {
      // Fallback to local encrypted store
    }
  }
  return getLocalTokenFallback(salesforceUserId)
}

/**
 * Refreshes an expired Salesforce access_token using the stored refresh_token
 * (`grant_type=refresh_token`) and updates `sf_tokens` in Supabase (plus local fallback).
 */
export async function refreshSalesforceAccessToken(
  salesforceUserId: string,
  currentRefreshToken?: string,
  currentInstanceUrl?: string
): Promise<ValidSalesforceToken> {
  const { clientId, clientSecret, loginUrl } = getSalesforceEnv()

  let refreshToken = currentRefreshToken
  let instanceUrl = currentInstanceUrl

  const existingRecord = await fetchStoredTokenRecord(salesforceUserId)

  if (!refreshToken || !instanceUrl) {
    if (!existingRecord) {
      throw new Error(
        `SALESFORCE_TOKEN_NOT_FOUND: No token record found for ${salesforceUserId}`
      )
    }
    refreshToken = unsealToken(existingRecord.refresh_token)
    instanceUrl = existingRecord.instance_url
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  })

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[SF Token Refresh] Failed to refresh token:', errText)
    throw new Error(
      `SALESFORCE_REFRESH_FAILED: Token refresh failed with status ${response.status}`
    )
  }

  const refreshedData = (await response.json()) as {
    access_token: string
    instance_url?: string
    issued_at?: string
  }

  const newAccessToken = refreshedData.access_token
  const newInstanceUrl = refreshedData.instance_url ?? instanceUrl
  const nowIso = new Date().toISOString()
  const sealedAccess = sealToken(newAccessToken)

  if (isSupabaseConfigured()) {
    try {
      const supabaseAdmin = createServiceRoleClient()
      const { error: updateError } = await supabaseAdmin
        .from('sf_tokens')
        .update({
          access_token: sealedAccess,
          instance_url: newInstanceUrl,
          issued_at: refreshedData.issued_at
            ? new Date(Number(refreshedData.issued_at)).toISOString()
            : nowIso,
          updated_at: nowIso,
        })
        .eq('salesforce_user_id', salesforceUserId)

      if (updateError) {
        console.warn(
          '[SF Token Refresh] Supabase update warning:',
          updateError.message
        )
      }
    } catch (err) {
      console.warn('[SF Token Refresh] Supabase unreachable, updating local store:', err)
    }
  }

  if (existingRecord) {
    saveLocalTokenFallback({
      ...existingRecord,
      access_token: sealedAccess,
      instance_url: newInstanceUrl,
      updated_at: nowIso,
    })
  }

  return {
    accessToken: newAccessToken,
    instanceUrl: newInstanceUrl,
    salesforceUserId,
  }
}

/**
 * Retrieves a valid Salesforce access token and instance URL for `salesforceUserId`.
 */
export async function getValidAccessToken(
  salesforceUserId?: string
): Promise<ValidSalesforceToken> {
  let targetUserId = salesforceUserId

  if (!targetUserId) {
    const session = await getSalesforceSession()
    targetUserId = session?.salesforceUserId
  }

  if (!targetUserId) {
    throw new Error('SALESFORCE_UNAUTHENTICATED: No active Salesforce user session.')
  }

  const tokenRow = await fetchStoredTokenRecord(targetUserId)

  if (!tokenRow) {
    throw new Error(
      `SALESFORCE_TOKEN_NOT_FOUND: No token record found in sf_tokens for user ${targetUserId}`
    )
  }

  const accessToken = unsealToken(tokenRow.access_token)
  const refreshToken = unsealToken(tokenRow.refresh_token)
  const instanceUrl = tokenRow.instance_url

  // Probe Salesforce to verify the access token is still valid
  const probeResponse = await fetch(
    `${instanceUrl}/services/data/${SF_API_VERSION}/limits`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    }
  )

  if (probeResponse.ok) {
    return {
      accessToken,
      instanceUrl,
      salesforceUserId: targetUserId,
    }
  }

  if (probeResponse.status === 401) {
    console.info(
      `[SF Token] 401 Unauthorized for ${targetUserId}. Refreshing via refresh_token...`
    )
    return refreshSalesforceAccessToken(targetUserId, refreshToken, instanceUrl)
  }

  const errBody = await probeResponse.text()
  throw new Error(
    `SALESFORCE_VERIFY_ERROR: Unexpected status ${probeResponse.status}: ${errBody}`
  )
}
