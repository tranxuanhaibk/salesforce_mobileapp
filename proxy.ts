import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js Proxy (previously Middleware) — Route Protection
 * Renamed from middleware.ts → proxy.ts for Next.js 16 compatibility.
 *
 * Protected routes (require Supabase auth):
 *   /dashboard/**
 *
 * Public routes (always accessible):
 *   /login
 *   /api/auth/salesforce (OAuth flow — must be accessible to initiate)
 *   /api/auth/salesforce/callback
 *
 * Also refreshes the Supabase session token on every request.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Always refresh session (even on public routes) ─────────────
  const { supabaseResponse, user } = await updateSession(request)

  // ── Protected route guard ──────────────────────────────────────
  const isProtected = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname === '/login'

  if (isProtected && !user) {
    // Redirect unauthenticated users to /login, preserving the intended URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && user) {
    // Already logged in — redirect away from /login
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public asset files (.svg, .png, .jpg, .ico, .webp)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
