'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'

const TAP_THRESHOLD = 3
const TAP_WINDOW_MS = 1200

// Hidden admin entry point: tap this element 3 times within 1.2s. A normal
// click/tap requires no movement, so it's naturally immune to accidental
// triggers during scroll — no extra gesture-cancellation logic needed.
export default function SecretAdminTrigger({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const tapCount  = useRef(0)
  const tapTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pulsing, setPulsing]   = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  function handleTap() {
    tapCount.current += 1
    if (tapTimer.current) clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => { tapCount.current = 0 }, TAP_WINDOW_MS)

    if (tapCount.current >= TAP_THRESHOLD) {
      tapCount.current = 0
      if (tapTimer.current) clearTimeout(tapTimer.current)
      triggerAccess()
    }
  }

  async function triggerAccess() {
    setPulsing(true)
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40)
    setTimeout(() => setPulsing(false), 500)

    try {
      const res = await fetch('/api/rsvp', { cache: 'no-store' })
      if (res.status === 200) {
        router.push('/admin')
        return
      }
    } catch {}
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Սխալ գաղտնաբառ')
        return
      }
      window.location.href = '/admin'
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.span
        onClick={handleTap}
        animate={pulsing ? { opacity: [1, 0.35, 1] } : {}}
        transition={{ duration: 0.5 }}
        className={className}
        style={{ userSelect: 'none' }}
      >
        {children}
      </motion.span>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.form
              onSubmit={handleSubmit}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="card-elegant border border-gold/30 max-w-xs w-full p-8 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-5 h-5 text-gold-dark" />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Գաղտնաբառ"
                className="input-elegant mb-3"
                autoFocus
              />
              {error && <p className="text-xs text-burgundy font-lato mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading || !password}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Ստուգվում է…' : 'Մուտք'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
