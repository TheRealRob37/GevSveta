import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, expectedSessionToken, isValidPassword } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: 'Սխալ գաղտնաբառ' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, await expectedSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
    secure:   process.env.NODE_ENV === 'production',
  })
  return res
}
