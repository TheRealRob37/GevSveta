import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, isValidSessionToken } from '@/lib/adminAuth'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (await isValidSessionToken(token)) {
    return NextResponse.next()
  }
  const loginUrl = new URL('/admin/login', req.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin', '/admin/((?!login).*)'],
}
