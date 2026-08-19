'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import type { GuestStatus, GuestSide, RsvpEntry } from '@/lib/rsvpStore'

export interface GuestFormValues {
  name:      string
  status:    GuestStatus
  guests:    number
  guestSide: GuestSide
}

function resizeNames(names: string[], count: number): string[] {
  const next = names.slice(0, count)
  while (next.length < count) next.push('')
  return next
}

export default function GuestFormModal({ guest, onSave, onClose }: {
  guest?: RsvpEntry
  onSave: (values: GuestFormValues) => Promise<void>
  onClose: () => void
}) {
  const [names, setNames]       = useState<string[]>(() => {
    const initial = guest?.name?.split(',').map(n => n.trim()).filter(Boolean) ?? []
    return initial.length > 0 ? initial : ['']
  })
  const [status, setStatus]     = useState<GuestStatus>(guest?.status ?? 'attending')
  const [guests, setGuests]     = useState<number>(guest?.guests ?? 1)
  const [guestSide, setGuestSide] = useState<GuestSide>(guest?.guestSide ?? 'gevorg')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  function setName(index: number, value: string) {
    setNames(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function changeStatus(next: GuestStatus) {
    setStatus(next)
    if (next === 'declined') {
      setNames(prev => resizeNames(prev, 1))
    } else {
      const count = guests || 1
      setGuests(count)
      setNames(prev => resizeNames(prev, count))
    }
  }

  function changeGuests(count: number) {
    setGuests(count)
    setNames(prev => resizeNames(prev, count))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (names.some(n => !n.trim())) {
      setError('Խնդրում ենք մուտքագրել բոլոր հյուրերի անուն ազգանունը')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        name:      names.map(n => n.trim()).join(', '),
        status,
        guests:    status === 'attending' ? guests : 0,
        guestSide,
      })
    } catch {
      if (mounted.current) setError('Չհաջողվեց պահպանել։ Փորձեք կրկին։')
    } finally {
      if (mounted.current) setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-charcoal/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="card-elegant border border-gold/30 max-w-sm w-full p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal-light hover:text-charcoal transition-colors"
          aria-label="Փակել"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-playfair text-xl text-charcoal mb-6">
          {guest ? 'Խմբագրել Հյուրին' : 'Ավելացնել Հյուր'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-lato text-xs tracking-widest uppercase text-charcoal-light mb-2">
              Ում հյուրն է
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'gevorg', label: 'Գևորգի', emoji: '🤵🏻‍♂️' },
                { value: 'sveta',  label: 'Սվետայի', emoji: '👰🏻‍♀️' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGuestSide(opt.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-lato transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    guestSide === opt.value
                      ? 'bg-gold text-charcoal border-gold shadow-md'
                      : 'bg-white border-gold/30 text-charcoal hover:border-gold/60'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-lato text-xs tracking-widest uppercase text-charcoal-light mb-2">
              Կարգավիճակ
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'attending', label: 'Ներկա կլինի' },
                { value: 'declined',  label: 'Չի կարող' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => changeStatus(opt.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-lato transition-all duration-200 ${
                    status === opt.value
                      ? opt.value === 'attending'
                        ? 'bg-gold text-charcoal border-gold shadow-md'
                        : 'bg-burgundy text-ivory border-burgundy shadow-md'
                      : 'bg-white border-gold/30 text-charcoal hover:border-gold/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {status === 'attending' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <label className="block font-lato text-xs tracking-widest uppercase text-charcoal-light mb-2">
                  Հյուրերի Թիվ
                </label>
                <div className="relative">
                  <select
                    value={guests}
                    onChange={e => changeGuests(Number(e.target.value))}
                    className="input-elegant appearance-none pr-10"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>{n === 1 ? 'Միայն ինքը' : `${n} հոգի`}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block font-lato text-xs tracking-widest uppercase text-charcoal-light mb-3">
              {names.length > 1 ? 'Հյուրերի Անուն Ազգանունը' : 'Անուն Ազգանուն'}
            </label>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {names.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="relative"
                  >
                    {names.length > 1 && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gold/20 text-gold-dark text-[11px] font-lato font-semibold flex items-center justify-center pointer-events-none">
                        {i + 1}
                      </span>
                    )}
                    <input
                      type="text"
                      value={n}
                      onChange={e => setName(i, e.target.value)}
                      placeholder="Անուն Ազգանուն"
                      className={`input-elegant ${names.length > 1 ? 'pl-11' : ''}`}
                      autoFocus={i === 0}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {error && <p className="text-xs text-burgundy font-lato">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Պահպանվում է…' : 'Պահպանել'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
