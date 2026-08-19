import { NextRequest, NextResponse } from 'next/server'
import { addRsvp, listRsvps } from '@/lib/rsvpStore'
import { ADMIN_COOKIE, isValidSessionToken } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (
    !body ||
    typeof body.name !== 'string' || !body.name.trim() ||
    (body.attendance !== 'yes' && body.attendance !== 'no') ||
    typeof body.guests !== 'number' ||
    (body.guestSide !== 'gevorg' && body.guestSide !== 'sveta')
  ) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  const entry = await addRsvp({
    name:      body.name.trim(),
    status:    body.attendance === 'yes' ? 'attending' : 'declined',
    guests:    body.attendance === 'yes' ? Math.max(1, body.guests) : 0,
    guestSide: body.guestSide,
  })

  return NextResponse.json(entry, { status: 201 })
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!(await isValidSessionToken(token))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const entries = await listRsvps()
  return NextResponse.json(entries)
}
