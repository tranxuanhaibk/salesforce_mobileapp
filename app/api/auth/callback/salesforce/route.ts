import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import {
  encodeSalesforceSession,
  getSalesforceEnv,
  isSupabaseConfigured,
  saveLocalTokenFallback,
  sealToken,
  SF_SESSION_COOKIE,
} from '@/lib/salesforce/token'

export const dynamic = 'force-dynamic'

interface SalesforceTokenResponse {
  access_token: string
  refresh_token?: string
  instance_url: string
  id: string
  token_type?: string
  issued_at?: string
  signature?: string
}

/**
 * Extracts a detailed error message including Node's underlying `cause` (e.g. ENOTFOUND, ECONNREFUSED).
 */
function formatFetchException(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  const cause = (err as Error & { cause?: unknown }).cause
  if (cause instanceof Error) {
    const code = (cause as NodeJS.ErrnoException).code
    return `${err.message} (${code ? `${code}: ` : ''}${cause.message})`
  }
  if (cause && typeof cause === 'object') {
    return `${err.message} (${JSON.stringify(cause)})`
  }
  return err.message
}

/**
 * GET /api/auth/callback/salesforce
 *
 * Handles the Salesforce OAuth2 Web Server Flow callback:
 * 1. Validates `state` and retrieves PKCE `code_verifier` from httpOnly cookies.
 * 2. Exchanges `code` for `access_token`, `refresh_token`, `instance_url`, and `id`
 *    via POST to `${loginUrl}/services/oauth2/token` with
 *    `Content-Type: application/x-www-form-urlencoded` and `URLSearchParams`.
 * 3. Logs full HTTP status code and response body if Salesforce returns an error.
 * 4. Upserts the token record into `sf_tokens` on Supabase via Service Role client
 *    (plus encrypted local fallback).
 * 5. Sets an encrypted `httpOnly` session cookie (`sf_session`) and redirects to `/`.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin

  if (oauthError) {
    const errorDesc = searchParams.get('error_description') ?? oauthError
    console.error('[SF Callback] OAuth error from Salesforce:', {
      error: oauthError,
      error_description: errorDesc,
    })
    return NextResponse.redirect(
      `${appUrl}/?error=${encodeURIComponent(`${oauthError}: ${errorDesc}`)}`
    )
  }

  if (!code || !state) {
    console.error('[SF Callback] Missing code or state in callback query params')
    return NextResponse.redirect(`${appUrl}/?error=missing_code_or_state`)
  }

  // 1. Validate CSRF state & read PKCE code_verifier
  const cookieStore = await cookies()
  const savedState = cookieStore.get('sf_oauth_state')?.value
  const codeVerifier = cookieStore.get('sf_oauth_verifier')?.value

  if (!savedState || savedState !== state) {
    console.error('[SF Callback] CSRF state mismatch:', {
      receivedState: state,
      savedState: savedState ?? null,
    })
    return NextResponse.redirect(`${appUrl}/?error=invalid_oauth_state`)
  }

  cookieStore.delete('sf_oauth_state')
  cookieStore.delete('sf_oauth_verifier')

  // 2. Exchange authorization code for tokens via application/x-www-form-urlencoded
  const { clientId, clientSecret, redirectUri, loginUrl } = getSalesforceEnv(
    request.nextUrl.origin
  )
  const tokenEndpoint = `${loginUrl.replace(/\/+$/, '')}/services/oauth2/token`

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  })

  if (codeVerifier) {
    tokenParams.set('code_verifier', codeVerifier)
  }

  let tokenData: SalesforceTokenResponse
  try {
    console.info('[SF Callback] Exchanging authorization code at:', tokenEndpoint)

    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenParams,
      cache: 'no-store',
    })

    const rawResponseBody = await tokenRes.text()

    if (!tokenRes.ok) {
      console.error('[SF Callback] Token exchange failed from Salesforce:', {
        endpoint: tokenEndpoint,
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        responseBody: rawResponseBody,
      })
      return NextResponse.redirect(
        `${appUrl}/?error=${encodeURIComponent(
          `token_exchange_failed (HTTP ${tokenRes.status} ${tokenRes.statusText}): ${rawResponseBody}`
        )}`
      )
    }

    try {
      tokenData = JSON.parse(rawResponseBody) as SalesforceTokenResponse
    } catch (parseErr) {
      console.error('[SF Callback] Invalid JSON in token response:', {
        status: tokenRes.status,
        rawResponseBody,
        parseErr,
      })
      return NextResponse.redirect(
        `${appUrl}/?error=${encodeURIComponent(
          `invalid_token_json (HTTP ${tokenRes.status}): ${rawResponseBody.slice(0, 200)}`
        )}`
      )
    }
  } catch (err) {
    const detailedError = formatFetchException(err)
    console.error('[SF Callback] Network error during token exchange:', {
      endpoint: tokenEndpoint,
      details: detailedError,
      rawError: err,
    })
    return NextResponse.redirect(
      `${appUrl}/?error=${encodeURIComponent(
        `token_exchange_network_error: ${detailedError}`
      )}`
    )
  }

  // Extract Salesforce User ID from Identity URL (e.g. https://login.salesforce.com/id/00D.../005...)
  const idParts = tokenData.id.split('/').filter(Boolean)
  const salesforceUserId = idParts[idParts.length - 1] || tokenData.id
  const orgId = idParts.length >= 2 ? idParts[idParts.length - 2] : undefined

  // Optional: Fetch display name & username from Identity URL
  let displayName = 'Salesforce User'
  let username = salesforceUserId
  try {
    const identityRes = await fetch(tokenData.id, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: 'no-store',
    })
    if (identityRes.ok) {
      const identityJson = (await identityRes.json()) as {
        display_name?: string
        username?: string
        organization_id?: string
      }
      displayName = identityJson.display_name || displayName
      username = identityJson.username || username
    }
  } catch {
    // Non-fatal if identity endpoint is unreachable
  }

  const issuedAtIso = tokenData.issued_at
    ? new Date(Number(tokenData.issued_at)).toISOString()
    : new Date().toISOString()
  const nowIso = new Date().toISOString()
  const sealedAccess = sealToken(tokenData.access_token)
  const sealedRefresh = sealToken(tokenData.refresh_token ?? '')

  // Always save to local encrypted fallback so live Salesforce works even before Supabase is configured
  saveLocalTokenFallback({
    id: crypto.randomUUID(),
    user_id: null,
    salesforce_user_id: salesforceUserId,
    instance_url: tokenData.instance_url,
    access_token: sealedAccess,
    refresh_token: sealedRefresh,
    issued_at: issuedAtIso,
    updated_at: nowIso,
  })

  // 3. Persist tokens into `sf_tokens` table on Supabase using Service Role client (when configured)
  if (isSupabaseConfigured()) {
    let supabaseUserId: string | null = null
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      supabaseUserId = user?.id ?? null
    } catch {
      supabaseUserId = null
    }

    try {
      const supabaseAdmin = createServiceRoleClient()
      const { error: upsertError } = await supabaseAdmin.from('sf_tokens').upsert(
        {
          user_id: supabaseUserId,
          salesforce_user_id: salesforceUserId,
          instance_url: tokenData.instance_url,
          access_token: sealedAccess,
          refresh_token: sealedRefresh,
          issued_at: issuedAtIso,
          updated_at: nowIso,
        },
        { onConflict: 'salesforce_user_id' }
      )

      if (upsertError) {
        console.warn(
          '[SF Callback] Supabase sf_tokens upsert warning (using encrypted fallback):',
          upsertError.message
        )
      }
    } catch (err) {
      console.warn('[SF Callback] Supabase connection warning (using encrypted fallback):', err)
    }
  }

  // 4. Set encrypted session cookie on the client and redirect to Dashboard (/)
  const encryptedSession = encodeSalesforceSession({
    salesforceUserId,
    instanceUrl: tokenData.instance_url,
    orgId,
    displayName,
    username,
    issuedAt: issuedAtIso,
  })

  cookieStore.set(SF_SESSION_COOKIE, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return NextResponse.redirect(`${appUrl}/?connected=true`)
}
