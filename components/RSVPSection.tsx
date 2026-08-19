'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle, Users, ChevronDown } from 'lucide-react'

interface FormData {
  name:       string
  attendance: 'yes' | 'no' | ''
  plusOne:    number
}

const INITIAL: FormData = {
  name:       '',
  attendance: '',
  plusOne:    0,
}

function SuccessModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-charcoal/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{   scale: 0.85, opacity: 0, y: 20  }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className="card-elegant max-w-sm w-full p-10 text-center border border-gold/30"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-gold-dark" />
        </motion.div>

        <h3 className="font-playfair text-2xl text-charcoal mb-3">Շնորհակալություն</h3>
        <p className="font-cormorant italic text-charcoal-light text-lg mb-2">
          Հարգելի՛ {name},
        </p>
        <p className="font-lato text-charcoal-light text-sm leading-relaxed mb-8">
          Ձեր հաստատումն ստացել ենք։ Անհամբեր սպասում ենք Ձեզ տեսնել
          այս հրաշալի օրը:
        </p>
        <button onClick={onClose} className="btn-primary w-full justify-center">
          Փակել
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function RSVPSection() {
  const [form, setForm]       = useState<FormData>(INITIAL)
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true, amount: 0.2 })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.name.trim())  e.name       = 'Խնդրում ենք մուտքագրել Ձեր անունը'
    if (!form.attendance)   e.attendance = 'Խնդրում ենք ընտրել Ձեր մասնակցությունը'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       form.name.trim(),
          attendance: form.attendance,
          guests:     form.attendance === 'yes' ? form.plusOne + 1 : 0,
        }),
      })
      if (!res.ok) throw new Error('request failed')
      setSubmitted(true)
    } catch {
      setSubmitError('Ինչ-որ բան այն չգնաց։ Խնդրում ենք փորձել կրկին։')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSubmitted(false)
    setForm(INITIAL)
    setErrors({})
  }

  return (
    <>
      <AnimatePresence>
        {submitted && <SuccessModal name={form.name} onClose={handleClose} />}
      </AnimatePresence>

      <section className="relative py-24 sm:py-32 bg-ivory overflow-hidden" id="rsvp">
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-[0.05] pointer-events-none translate-x-1/3 translate-y-1/3"
          style={{ background: 'radial-gradient(circle, #FFE4C4 0%, transparent 70%)' }}
        />

        <div className="max-w-2xl mx-auto px-6">

          {/* heading */}
          <motion.div
            ref={titleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <h2 className="font-playfair text-4xl sm:text-5xl text-charcoal mb-4">
              Մասնակցության Հաստատում
            </h2>
            <p className="font-cormorant italic text-charcoal-light text-lg leading-relaxed">
              Խնդրում ենք հաստատել Ձեր մասնակցությունը մինչև 2026թ. սեպտեմբերի 15-ը:
            </p>
            <div className="w-16 h-px bg-gold/40 mx-auto mt-6" />
          </motion.div>

          {/* form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <form
              onSubmit={handleSubmit}
              className="card-elegant border border-gold/20 p-8 sm:p-10 space-y-6"
              noValidate
            >
              {/* name */}
              <div>
                <label className="block font-lato text-xs tracking-widest uppercase text-charcoal-light mb-2">
                  Անուն Ազգանուն <span className="text-burgundy">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Ձեր Անուն Ազգանունը"
                  className={`input-elegant ${errors.name ? 'border-burgundy focus:border-burgundy focus:ring-burgundy/20' : ''}`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-burgundy font-lato">{errors.name}</p>
                )}
              </div>

              {/* attendance */}
              <div>
                <label className="block font-lato text-xs tracking-widest uppercase text-charcoal-light mb-3">
                  Մասնակցություն <span className="text-burgundy">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'yes', label: 'Ներկա կլինեմ', emoji: '🥂' },
                    { value: 'no',  label: 'Ցավոք, չեմ կարող', emoji: '💌' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('attendance', opt.value)}
                      className={`px-4 py-3.5 rounded-xl border text-sm font-lato transition-all duration-200 flex items-center justify-center gap-2 ${
                        form.attendance === opt.value
                          ? opt.value === 'yes'
                            ? 'bg-gold text-charcoal border-gold shadow-md'
                            : 'bg-burgundy text-ivory border-burgundy shadow-md'
                          : 'bg-white border-gold/30 text-charcoal hover:border-gold/60 hover:bg-ivory-dark'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                {errors.attendance && (
                  <p className="mt-1.5 text-xs text-burgundy font-lato">{errors.attendance}</p>
                )}
              </div>

              {/* plus one — only shown when attending */}
              <AnimatePresence>
                {form.attendance === 'yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <label className="block font-lato text-xs tracking-widest uppercase text-charcoal-light mb-2">
                      <Users className="inline w-3.5 h-3.5 mr-1.5 text-gold" />
                      Հյուրերի Թիվ (Ձեզ ներառյալ)
                    </label>
                    <div className="relative">
                      <select
                        value={form.plusOne}
                        onChange={e => set('plusOne', Number(e.target.value))}
                        className="input-elegant appearance-none pr-10"
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n - 1}>
                            {n === 1 ? 'Միայն ես' : `${n} հոգի`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full"
                    />
                    Ուղարկվում է…
                  </span>
                ) : (
                  'Հաստատել Ներկայությունը'
                )}
              </motion.button>

              {submitError && (
                <p className="text-center font-lato text-xs text-burgundy">{submitError}</p>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </>
  )
}
