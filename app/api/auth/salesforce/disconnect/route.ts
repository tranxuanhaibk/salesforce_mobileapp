import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient, type SfTokenRecord } from '@/lib/supabase/server'
import {
  deleteLocalTokenFallback,
  getLocalTokenFallback,
  getSalesforceEnv,
  getSalesforceSession,
  isSupabaseConfigured,
  SF_SESSION_COOKIE,
  unsealToken,
} from '@/lib/salesforce/token'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/salesforce/disconnect
 *
 * 1. Reads the current Salesforce session from cookie.
 * 2. Revokes the token at Salesforce (/services/oauth2/revoke).
 * 3. Deletes the token record from `sf_tokens` in Supabase (and local fallback).
 * 4. Clears the `sf_session` cookie.
 */
export async function POST() {
  try {
    const session = await getSalesforceSession()
    const cookieStore = await cookies()

    if (session?.salesforceUserId) {
      const { loginUrl } = getSalesforceEnv()
      let tokenRow: SfTokenRecord | null = getLocalTokenFallback(
        session.salesforceUserId
      )

      if (isSupabaseConfigured()) {
        try {
          const supabaseAdmin = createServiceRoleClient()
          const { data } = await supabaseAdmin
            .from('sf_tokens')
            .select('*')
            .eq('salesforce_user_id', session.salesforceUserId)
            .single<SfTokenRecord>()
          if (data) tokenRow = data

          await supabaseAdmin
            .from('sf_tokens')
            .delete()
            .eq('salesforce_user_id', session.salesforceUserId)
        } catch (err) {
          console.warn('[SF Disconnect] Supabase cleanup warning:', err)
        }
      }

      if (tokenRow) {
        const tokenToRevoke = unsealToken(
          tokenRow.refresh_token || tokenRow.access_token
        )
        if (tokenToRevoke) {
          await fetch(`${loginUrl}/services/oauth2/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ token: tokenToRevoke }).toString(),
          }).catch((err) => {
            console.warn('[SF Disconnect] Token revoke warning:', err)
          })
        }
      }

      deleteLocalTokenFallback(session.salesforceUserId)
    }

    cookieStore.delete(SF_SESSION_COOKIE)

    return NextResponse.json({
      success: true,
      message: 'Disconnected from Salesforce and revoked token.',
    })
  } catch (err) {
    console.error('[SF Disconnect] Error:', err)
    return NextResponse.json(
      { error: 'Failed to disconnect Salesforce session' },
      { status: 500 }
    )
  }
}
