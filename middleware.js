import { NextResponse } from 'next/server'

export async function middleware(req) {
  const isLoginPage = req.nextUrl.pathname === '/login'

  // Check for supabase auth token in cookies
  const token = req.cookies.get('sb-vcctyhglcilodnvaqszk-auth-token')
  const hasSession = !!token

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
