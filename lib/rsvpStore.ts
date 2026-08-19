import { promises as fs } from 'fs'
import path from 'path'

export interface RsvpEntry {
  id:          string
  name:        string
  attendance:  'yes' | 'no'
  guests:      number
  submittedAt: string
}

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

export async function listRsvps(): Promise<RsvpEntry[]> {
  await ensureFile()
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  try {
    return JSON.parse(raw) as RsvpEntry[]
  } catch {
    return []
  }
}

export async function addRsvp(entry: Omit<RsvpEntry, 'id' | 'submittedAt'>): Promise<RsvpEntry> {
  const all = await listRsvps()
  const created: RsvpEntry = {
    ...entry,
    id:          crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  }
  all.push(created)
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8')
  return created
}
