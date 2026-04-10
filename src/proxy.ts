// Proxy in Next.js is code that runs before a user is allowed to see any page.
// Think of it as a bouncer standing at the door checking IDs.

// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const payloadToken = request.cookies.get('payload-token')

  // Если токена нет, перенаправляем на логин
  if (!payloadToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/flaechen/:path*'],
}
