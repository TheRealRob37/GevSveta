'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { GuestStatus, GuestSide, RsvpEntry } from '@/lib/rsvpStore'

export interface GuestFormValues {
  name:      string
  status:    GuestStatus
  guests:    number
  guestSide: GuestSide
}

export default function GuestFormModal({ guest, onSave, onClose }: {
  guest?: RsvpEntry
  onSave: (values: GuestFormValues) => Promise<void>
  onClose: () => void
}) {
  const [values, setValues] = useState<GuestFormValues>({
    name:      guest?.name ?? '',
    status:    guest?.status ?? 'attending',
    guests:    guest?.guests ?? 1,
    guestSide: guest?.guestSide ?? 'gevorg',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.name.trim()) {
      setError('Խնդրում ենք մուտքագրել անունը')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(values)
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
        className="card-elegant border border-gold/30 max-w-sm w-full p-8 relative"
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
              Անուն Ազգանուն
            </label>
            <input
              type="text"
              value={values.name}
              onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
              className="input-elegant"
              autoFocus
            />
          </div>

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
                  onClick={() => setValues(v => ({ ...v, guestSide: opt.value }))}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-lato transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    values.guestSide === opt.value
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
                  onClick={() => setValues(v => ({
                    ...v,
                    status: opt.value,
                    guests: opt.value === 'declined' ? 0 : (v.guests || 1),
                  }))}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-lato transition-all duration-200 ${
                    values.status === opt.value
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
            {values.status === 'attending' && (
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
                <input
                  type="number"
                  min={1}
                  value={values.guests}
                  onChange={e => setValues(v => ({ ...v, guests: Math.max(1, Number(e.target.value)) }))}
                  className="input-elegant"
                />
              </motion.div>
            )}
          </AnimatePresence>

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
