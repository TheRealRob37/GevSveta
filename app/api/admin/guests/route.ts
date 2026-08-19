import { NextRequest, NextResponse } from 'next/server'
import { addRsvp } from '@/lib/rsvpStore'
import { ADMIN_COOKIE, isValidSessionToken } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!(await isValidSessionToken(token))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)

  if (
    !body ||
    typeof body.name !== 'string' || !body.name.trim() ||
    (body.status !== 'attending' && body.status !== 'declined') ||
    typeof body.guests !== 'number'
  ) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  const entry = await addRsvp({
    name:   body.name.trim(),
    status: body.status,
    guests: Math.max(0, body.guests),
  })

  return NextResponse.json(entry, { status: 201 })
}
