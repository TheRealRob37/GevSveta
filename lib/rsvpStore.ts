import { promises as fs } from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'

export type GuestStatus = 'attending' | 'declined'

export interface RsvpEntry {
  id:          string
  name:        string
  status:      GuestStatus
  guests:      number
  submittedAt: string
  updatedAt:   string
}

export type GuestPatch = Partial<Pick<RsvpEntry, 'name' | 'status' | 'guests'>>

const REDIS_KEY = 'rsvps' // hash: id -> RsvpEntry

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null

// Local file fallback — used only when no Upstash env vars are configured
// (i.e. local dev). Vercel's filesystem is read-only, so production always
// goes through Redis.
const DATA_DIR  = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json')

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8')
  }
}

async function readFile(): Promise<RsvpEntry[]> {
  await ensureFile()
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  try {
    return JSON.parse(raw) as RsvpEntry[]
  } catch {
    return []
  }
}

async function writeFile(all: RsvpEntry[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export async function listRsvps(): Promise<RsvpEntry[]> {
  if (!redis) return readFile()
  const all = await redis.hgetall<Record<string, RsvpEntry>>(REDIS_KEY)
  return all ? Object.values(all) : []
}

export async function addRsvp(entry: Omit<RsvpEntry, 'id' | 'submittedAt' | 'updatedAt'>): Promise<RsvpEntry> {
  const now = new Date().toISOString()
  const created: RsvpEntry = {
    ...entry,
    id:          crypto.randomUUID(),
    submittedAt: now,
    updatedAt:   now,
  }

  if (redis) {
    await redis.hset(REDIS_KEY, { [created.id]: created })
  } else {
    const all = await readFile()
    all.push(created)
    await writeFile(all)
  }

  return created
}

export async function updateRsvp(id: string, patch: GuestPatch): Promise<RsvpEntry | null> {
  if (redis) {
    const existing = await redis.hget<RsvpEntry>(REDIS_KEY, id)
    if (!existing) return null
    const updated: RsvpEntry = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    await redis.hset(REDIS_KEY, { [id]: updated })
    return updated
  }

  const all = await readFile()
  const index = all.findIndex(e => e.id === id)
  if (index === -1) return null
  const updated: RsvpEntry = { ...all[index], ...patch, updatedAt: new Date().toISOString() }
  all[index] = updated
  await writeFile(all)
  return updated
}

export async function deleteRsvp(id: string): Promise<boolean> {
  if (redis) {
    const removed = await redis.hdel(REDIS_KEY, id)
    return removed > 0
  }

  const all = await readFile()
  const next = all.filter(e => e.id !== id)
  if (next.length === all.length) return false
  await writeFile(next)
  return true
}
