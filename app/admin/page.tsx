'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import {
  LogOut, RefreshCw, Users, CheckCircle2, XCircle, ListChecks,
  Search, Plus, Pencil, Trash2, FileDown,
} from 'lucide-react'
import { COUPLE_NAMES } from '@/lib/constants'
import type { RsvpEntry, GuestStatus } from '@/lib/rsvpStore'
import GuestFormModal, { type GuestFormValues } from '@/components/GuestFormModal'

const POLL_INTERVAL_MS = 20_000
type StatusFilter = 'all' | GuestStatus

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

// Renders via the browser (so Armenian glyphs are handled correctly by the
// system font stack) and rasterizes that into a PDF — jsPDF's built-in fonts
// don't support Armenian, so a plain text PDF would render as blank boxes.
async function exportGuestListPdf(node: HTMLElement) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth  = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth   = pageWidth
  const imgHeight  = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save('guest-list.pdf')
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<RsvpEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<StatusFilter>('all')
  const [modalGuest, setModalGuest] = useState<RsvpEntry | 'new' | null>(null)
  const [busyId, setBusyId]   = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const loggingOut = useRef(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/rsvp', { cache: 'no-store' })
      if (res.status === 401) {
        if (!loggingOut.current) router.push('/admin/login')
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
    loggingOut.current = true
    await fetch('/api/admin/logout', { method: 'POST' })
    // hard navigation to the current origin's homepage — avoids any stale
    // client-router cache carrying over the just-cleared session state,
    // and window.location.origin guarantees we land on whichever domain
    // (gevsveta.com, www.gevsveta.com, preview URL, localhost) is actually
    // serving this page rather than relying on relative-path resolution.
    window.location.href = window.location.origin + '/'
  }

  async function handleSaveGuest(values: GuestFormValues) {
    const isNew = modalGuest === 'new'
    const url = isNew ? '/api/admin/guests' : `/api/admin/guests/${(modalGuest as RsvpEntry).id}`
    const res = await fetch(url, {
      method:  isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(values),
    })
    if (!res.ok) throw new Error('save failed')
    setModalGuest(null)
    await load()
  }

  async function handleDelete(entry: RsvpEntry) {
    if (!window.confirm(`Ջնջե՞լ ${entry.name}-ին ցուցակից։ Այս գործողությունը հնարավոր չէ հետարկել։`)) return
    setBusyId(entry.id)
    try {
      const res = await fetch(`/api/admin/guests/${entry.id}`, { method: 'DELETE' })
      if (res.ok) await load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleStatusToggle(entry: RsvpEntry, status: GuestStatus) {
    setBusyId(entry.id)
    try {
      const res = await fetch(`/api/admin/guests/${entry.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (res.ok) await load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleExportPdf() {
    if (!printRef.current) return
    setExporting(true)
    try {
      await exportGuestListPdf(printRef.current)
    } finally {
      setExporting(false)
    }
  }

  const filtered = useMemo(() => {
    return entries
      .filter(e => filter === 'all' || e.status === filter)
      .filter(e => e.name.toLowerCase().includes(search.trim().toLowerCase()))
  }, [entries, filter, search])

  const attending = entries.filter(e => e.status === 'attending')
  const declined  = entries.filter(e => e.status === 'declined')
  const totalGuests = attending.reduce((sum, e) => sum + e.guests, 0)

  return (
    <main className="min-h-screen bg-ivory-dark px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="font-lato text-xs tracking-[0.3em] uppercase text-gold-dark mb-1">Ադմին Վահանակ</p>
            <h1 className="font-playfair text-3xl text-charcoal">{COUPLE_NAMES} — Հյուրերի Ցուցակ</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="btn-outline py-2.5 px-4 text-xs">
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
          <StatCard label="Ընդհանուր Հրավիրված" value={entries.length} icon={ListChecks} tone="gold" />
          <StatCard label="Ներկա Կլինեն (հյուրերի հետ)" value={totalGuests} icon={CheckCircle2} tone="sage" />
          <StatCard label="Հրաժարված" value={declined.length} icon={XCircle} tone="burgundy" />
        </div>

        {/* toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Փնտրել անունով…"
              className="input-elegant pl-10"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white/70 border border-gold/20 rounded-xl p-1">
            {([
              { value: 'all', label: 'Բոլորը' },
              { value: 'attending', label: 'Ներկա' },
              { value: 'declined', label: 'Հրաժարված' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-xs font-lato tracking-wide whitespace-nowrap transition-all duration-200 ${
                  filter === opt.value ? 'bg-gold text-charcoal' : 'text-charcoal-light hover:bg-ivory-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="btn-outline py-2.5 px-4 text-xs whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FileDown className="w-3.5 h-3.5" />
            {exporting ? 'Ստեղծվում է…' : 'Export PDF'}
          </button>

          <button
            onClick={() => setModalGuest('new')}
            className="btn-primary py-2.5 px-4 text-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Ավելացնել Հյուր
          </button>
        </div>

        {/* table */}
        <div className="card-elegant border border-gold/20 overflow-hidden">
          {loading ? (
            <p className="p-8 text-center font-lato text-sm text-charcoal-light">Բեռնվում է…</p>
          ) : error ? (
            <p className="p-8 text-center font-lato text-sm text-burgundy">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center font-lato text-sm text-charcoal-light">Ոչինչ չի գտնվել</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light">Անուն</th>
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light">Կարգավիճակ</th>
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light">Հյուրեր</th>
                    <th className="px-6 py-4 font-lato text-xs tracking-widest uppercase text-charcoal-light text-right">Գործողություններ</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map(entry => (
                    <tr key={entry.id} className="border-b border-gold/10 last:border-0">
                      <td className="px-6 py-4 font-lato text-sm text-charcoal">{entry.name}</td>
                      <td className="px-6 py-4">
                        <select
                          value={entry.status}
                          disabled={busyId === entry.id}
                          onChange={e => handleStatusToggle(entry, e.target.value as GuestStatus)}
                          className={`text-xs font-lato tracking-wide px-2.5 py-1.5 rounded-full border-none outline-none cursor-pointer disabled:opacity-50 ${
                            entry.status === 'attending'
                              ? 'bg-sage/10 text-sage'
                              : 'bg-burgundy/10 text-burgundy'
                          }`}
                        >
                          <option value="attending">Ներկա կլինի</option>
                          <option value="declined">Չի կարող</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 font-lato text-sm text-charcoal-light">
                        {entry.status === 'attending' ? entry.guests : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModalGuest(entry)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-light hover:text-gold-dark hover:bg-gold/10 transition-colors"
                            aria-label="Խմբագրել"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
                            disabled={busyId === entry.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-light hover:text-burgundy hover:bg-burgundy/10 transition-colors disabled:opacity-50"
                            aria-label="Ջնջել"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* off-screen template captured for PDF export */}
      <div className="fixed top-0 left-[-9999px]" aria-hidden="true">
        <div ref={printRef} className="w-[780px] bg-white p-10 font-lato">
          <h2 className="font-playfair text-2xl text-charcoal mb-1">{COUPLE_NAMES}</h2>
          <p className="text-xs text-charcoal-light tracking-widest uppercase mb-6">Հյուրերի Ցուցակ</p>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b border-charcoal/20 py-2 pr-4 text-xs uppercase tracking-widest text-charcoal-light">Անուն</th>
                <th className="border-b border-charcoal/20 py-2 pr-4 text-xs uppercase tracking-widest text-charcoal-light">Կարգավիճակ</th>
                <th className="border-b border-charcoal/20 py-2 text-xs uppercase tracking-widest text-charcoal-light">Հյուրեր</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map(entry => (
                <tr key={entry.id}>
                  <td className="border-b border-charcoal/10 py-2 pr-4 text-sm text-charcoal">{entry.name}</td>
                  <td className="border-b border-charcoal/10 py-2 pr-4 text-sm text-charcoal">
                    {entry.status === 'attending' ? 'Ներկա կլինի' : 'Չի կարող'}
                  </td>
                  <td className="border-b border-charcoal/10 py-2 text-sm text-charcoal">
                    {entry.status === 'attending' ? entry.guests : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalGuest && (
          <GuestFormModal
            guest={modalGuest === 'new' ? undefined : modalGuest}
            onSave={handleSaveGuest}
            onClose={() => setModalGuest(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
