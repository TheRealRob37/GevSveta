'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RefreshCw, Users, CheckCircle2, XCircle, ListChecks } from 'lucide-react'
import { COUPLE_NAMES } from '@/lib/constants'

interface RsvpEntry {
  id:          string
  name:        string
  attendance:  'yes' | 'no'
  guests:      number
  submittedAt: string
}

const POLL_INTERVAL_MS = 20_000

function StatCard({ label, value, icon: Icon, tone }: {
  label: string; value: number; icon: typeof Users; tone: 'sage' | 'burgundy' | 'gold'
}) {
  const toneClasses = {
    sage:     'bg-sage/10 text-sage',
    burgundy: 'bg-burgundy/10 text-burgundy',
    gold:     'bg-gold/10 text-gold-dark',
  }[tone]

  return (
    <div className="card-elegant border border-gold/20 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${toneClasses}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-playfair text-2xl text-charcoal leading-none">{value}</p>
        <p className="font-lato text-xs tracking-widest uppercase text-charcoal-light mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<RsvpEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/rsvp', { cache: 'no-store' })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) throw new Error('failed')
      setEntries(await res.json())
      setError('')
    } catch {
      setError('Հնարավոր չէ բեռնել տվյալները')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const confirmed = entries.filter(e => e.attendance === 'yes')
  const declined  = entries.filter(e => e.attendance === 'no')
  const totalGuests = confirmed.reduce((sum, e) => sum + e.guests, 0)

  return (
    <main className="min-h-screen bg-ivory-dark px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="font-lato text-xs tracking-[0.3em] uppercase text-gold-dark mb-1">Ադմին Վահանակ</p>
            <h1 className="font-playfair text-3xl text-charcoal">{COUPLE_NAMES} — Հյուրերի Ցուցակ</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="btn-outline py-2.5 px-4 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Թարմացնել
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-burgundy/30 text-burgundy text-xs font-lato tracking-widest uppercase rounded-full hover:bg-burgundy hover:text-ivory transition-all duration-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              Ելք
            </button>
          </div>
        </div>

        {/* summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Ընդհանուր Պատասխաններ" value={entries.length} icon={ListChecks} tone="gold" />
          <StatCard label="Հաստատված (հյուրերի հետ)" value={totalGuests} icon={CheckCircle2} tone="sage" />
          <StatCard label="Հրաժարված" value={declined.length} icon={XCircle} tone="burgundy" />
        </div>

        {/* table */}
        <div className="card-elegant border border-gold/20 overflow-hidden">
          {loading ? (
            <p className="p-8 text-center font-lato text-sm text-charcoal-light">Բեռնվում է…</p>
          ) : error ? (
            <p className="p-8 text-center font-lato text-sm text-burgundy">{error}</p>
          ) : entries.length === 0 ? (
            <p className="p-8 text-center font-lato text-sm text-charcoal-light">Դեռ ոչ մի պատասխան չկա</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light">Անուն</th>
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light">Կարգավիճակ</th>
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light">Հյուրեր</th>
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light">Ամսաթիվ</th>
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-gold/10 last:border-0">
                      <td className="px-6 py-4 font-lato text-sm text-charcoal">{entry.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-lato tracking-wide px-2.5 py-1 rounded-full ${
                          entry.attendance === 'yes'
                            ? 'bg-sage/10 text-sage'
                            : 'bg-burgundy/10 text-burgundy'
                        }`}>
                          {entry.attendance === 'yes' ? 'Ներկա կլինի' : 'Չի կարող'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-lato text-sm text-charcoal-light">
                        {entry.attendance === 'yes' ? entry.guests : '—'}
                      </td>
                      <td className="px-6 py-4 font-lato text-xs text-charcoal-light">
                        {new Date(entry.submittedAt).toLocaleString('hy-AM')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
