import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getPublicEnv, getServerEnv } from '@/lib/env'

export interface SfTokenRecord {
  id: string
  user_id: string | null
  salesforce_user_id: string
  instance_url: string
  access_token: string
  refresh_token: string
  issued_at: string
  updated_at: string
}

/**
 * Creates a Supabase client for Server Components, Route Handlers, and Server Actions.
 * Uses Next.js async cookies() to read and refresh user sessions.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Safe to ignore when called inside a Server Component render pass
        }
      },
    },
  })
}

/**
 * Creates a Supabase Admin client using SUPABASE_SERVICE_ROLE_KEY.
 * Used exclusively on the server for managing `sf_tokens` during OAuth callbacks
 * and background token refreshes (bypasses RLS).
 */
export function createServiceRoleClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv()

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseAdmin(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
