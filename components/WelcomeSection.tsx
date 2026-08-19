'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function WelcomeSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-charcoal bg-cover bg-center"
      style={{ backgroundImage: `url('/photos/couple.jpg')` }}
    >
      {/* dark gradient overlay for text contrast */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.2))' }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#FFE4C4]/60" />
          <span className="font-cormorant text-2xl text-[#FFE4C4] select-none">✦</span>
          <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#FFE4C4]/60" />
        </div>

        <p className="font-cormorant text-xl sm:text-2xl md:text-3xl italic text-[#FFE4C4] leading-relaxed drop-shadow-sm">
          Սիրով հրավիրում ենք Ձեզ կիսելու մեզ հետ մեր կյանքի կարևորագույն
          և հիշարժան պահերից մեկը՝ մեր նշանադրության տոնական երեկոն։
        </p>
      </motion.div>
    </section>
  )
}
