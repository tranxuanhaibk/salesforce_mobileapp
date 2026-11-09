import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getOrgLimits } from '@/lib/salesforce/api'

// Opt out of prerendering — reads user session dynamically
export const dynamic = 'force-dynamic'

/**
 * GET /api/salesforce/limits
 *
 * Server-side proxy that fetches Salesforce Org Limits on behalf of the
 * authenticated user. The client component calls this endpoint — it never
 * directly holds access tokens.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limits = await getOrgLimits(user.id)
    return NextResponse.json(limits)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (message.startsWith('SALESFORCE_NOT_CONNECTED')) {
      return NextResponse.json({ error: 'Salesforce not connected' }, { status: 404 })
    }
    if (message.startsWith('SALESFORCE_REFRESH_FAILED')) {
      return NextResponse.json({ error: 'Salesforce session expired. Please reconnect.' }, { status: 401 })
    }

    console.error('[/api/salesforce/limits]', message)
    return NextResponse.json({ error: 'Failed to fetch Salesforce limits' }, { status: 500 })
  }
}
