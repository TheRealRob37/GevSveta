'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

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
      router.push('/admin')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="card-elegant border border-gold/20 p-10 w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-6 h-6 text-gold-dark" />
        </div>
        <h1 className="font-playfair text-2xl text-charcoal mb-2">Ադմինիստրատորի Մուտք</h1>
        <p className="font-cormorant italic text-charcoal-light text-base mb-8">
          Հյուրերի ցուցակը դիտելու համար մուտքագրեք գաղտնաբառը
        </p>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Գաղտնաբառ"
          className="input-elegant mb-4"
          autoFocus
        />

        {error && <p className="text-xs text-burgundy font-lato mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Ստուգվում է…' : 'Մուտք'}
        </button>
      </form>
    </main>
  )
}
