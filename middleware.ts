import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE, authToken, safeEqual } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/login']

/** Every page and API route needs the shared password, except the login page itself. */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  const password = process.env.APP_PASSWORD
  if (!password) {
    // Locked by default: never serve the app (and its paid API routes) without a password set.
    return new NextResponse('APP_PASSWORD is not set. Add it to .env.local or your Vercel environment variables.', {
      status: 500,
    })
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value
  if (cookie && safeEqual(cookie, await authToken(password))) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const loginUrl = new URL('/login', req.url)
  if (pathname !== '/') loginUrl.searchParams.set('next', pathname + search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
