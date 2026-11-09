import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { getSalesforceEnv } from '@/lib/salesforce/token'

export const dynamic = 'force-dynamic'

/**
 * Base64URL-encodes a Buffer (no padding, URL-safe characters) per RFC 7636.
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * GET /api/auth/salesforce
 *
 * Initiates the Salesforce OAuth 2.0 Web Server Flow with PKCE (S256).
 * 1. Generates a cryptographic PKCE code_verifier & code_challenge (S256).
 * 2. Generates a random CSRF state parameter.
 * 3. Stores both in httpOnly cookies (10-minute TTL).
 * 4. Redirects the user to `${SALESFORCE_LOGIN_URL}/services/oauth2/authorize`
 *    with scope="api refresh_token offline_access openid".
 */
export async function GET(request: NextRequest) {
  try {
    const { clientId, redirectUri, loginUrl } = getSalesforceEnv(
      request.nextUrl.origin
    )

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing SALESFORCE_CLIENT_ID environment variable' },
        { status: 500 }
      )
    }

    // 1. Generate PKCE code_verifier & S256 code_challenge
    const codeVerifier = base64UrlEncode(crypto.randomBytes(32))
    const codeChallenge = base64UrlEncode(
      crypto.createHash('sha256').update(codeVerifier).digest()
    )

    // 2. Generate CSRF state token
    const state = crypto.randomBytes(16).toString('hex')

    // 3. Store state and code_verifier in temporary httpOnly cookies
    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    }

    cookieStore.set('sf_oauth_state', state, cookieOptions)
    cookieStore.set('sf_oauth_verifier', codeVerifier, cookieOptions)

    // 4. Construct Salesforce OAuth2 authorize URL
    const authorizeParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'api refresh_token offline_access openid',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return NextResponse.redirect(
      `${loginUrl}/services/oauth2/authorize?${authorizeParams.toString()}`
    )
  } catch (err) {
    console.error('[SF OAuth Initiate] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Failed to initiate Salesforce OAuth2 flow' },
      { status: 500 }
    )
  }
}
