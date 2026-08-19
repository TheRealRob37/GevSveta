import { promises as fs } from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'

export interface RsvpEntry {
  id:          string
  name:        string
  attendance:  'yes' | 'no'
  guests:      number
  submittedAt: string
}

const REDIS_KEY = 'rsvps'

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

async function listFromFile(): Promise<RsvpEntry[]> {
  await ensureFile()
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  try {
    return JSON.parse(raw) as RsvpEntry[]
  } catch {
    return []
  }
}

async function addToFile(entry: RsvpEntry): Promise<void> {
  const all = await listFromFile()
  all.push(entry)
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export async function listRsvps(): Promise<RsvpEntry[]> {
  if (!redis) return listFromFile()
  return redis.lrange<RsvpEntry>(REDIS_KEY, 0, -1)
}

export async function addRsvp(entry: Omit<RsvpEntry, 'id' | 'submittedAt'>): Promise<RsvpEntry> {
  const created: RsvpEntry = {
    ...entry,
    id:          crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  }

  if (redis) {
    await redis.rpush(REDIS_KEY, created)
  } else {
    await addToFile(created)
  }

  return created
}
