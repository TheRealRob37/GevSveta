import { NextRequest, NextResponse } from 'next/server'
import { deleteRsvp, updateRsvp, type GuestPatch } from '@/lib/rsvpStore'
import { ADMIN_COOKIE, isValidSessionToken } from '@/lib/adminAuth'

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return isValidSessionToken(token)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  const patch: GuestPatch = {}
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim()
  if (body.status === 'attending' || body.status === 'declined') patch.status = body.status
  if (typeof body.guests === 'number') patch.guests = Math.max(0, body.guests)
  if (body.guestSide === 'gevorg' || body.guestSide === 'sveta') patch.guestSide = body.guestSide

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no valid fields to update' }, { status: 400 })
  }

  const updated = await updateRsvp(params.id, patch)
  if (!updated) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const removed = await deleteRsvp(params.id)
  if (!removed) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
