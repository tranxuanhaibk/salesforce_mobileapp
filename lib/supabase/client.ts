import { createBrowserClient } from '@supabase/ssr'
import { getPublicEnv } from '@/lib/env'

/**
 * Creates a Supabase client for use in Client Components.
 */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
