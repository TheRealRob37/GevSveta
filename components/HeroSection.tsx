'use client'

import { motion } from 'framer-motion'
import { GROOM_NAME, BRIDE_NAME, EVENT_DATE_DISPLAY } from '@/lib/constants'

const fadeUp = (delay = 0) => ({
  initial:  { opacity: 0, y: 30 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* layered background */}
      <div className="absolute inset-0 bg-[#3A1E08]" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 50% 0%, #C9995F 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 100%, #FFE4C4 0%, transparent 60%)
          `,
        }}
      />

      {/* damask lattice watermark */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FFE4C4' stroke-width='0.75'%3E%3Cpath d='M0 40 L40 0 L80 40 L40 80 Z'/%3E%3Cpath d='M40 0 L40 80 M0 40 L80 40' stroke-width='0.4' opacity='0.5'/%3E%3Ccircle cx='40' cy='40' r='3' fill='%23FFE4C4' stroke='none'/%3E%3Ccircle cx='0' cy='0' r='2' fill='%23FFE4C4' stroke='none'/%3E%3Ccircle cx='80' cy='0' r='2' fill='%23FFE4C4' stroke='none'/%3E%3Ccircle cx='0' cy='80' r='2' fill='%23FFE4C4' stroke='none'/%3E%3Ccircle cx='80' cy='80' r='2' fill='%23FFE4C4' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* top ornamental line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
      />

      {/* content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 sm:py-20 max-w-3xl mx-auto w-full">

        {/* couple names */}
        <motion.div {...fadeUp(0.3)} className="mb-4">
          <h1 className="font-playfair text-5xl sm:text-7xl md:text-9xl text-[#FFE4C4] leading-none tracking-normal">
            {GROOM_NAME}
          </h1>
        </motion.div>

        <motion.div {...fadeUp(0.45)} className="mb-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold/60" />
            <span className="font-cormorant italic text-[#C9995F] text-3xl sm:text-4xl">&amp;</span>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.55)} className="mb-8">
          <h1 className="font-playfair text-5xl sm:text-7xl md:text-9xl text-[#FFE4C4] leading-none tracking-normal">
            {BRIDE_NAME}
          </h1>
        </motion.div>

        <motion.div {...fadeUp(0.7)}>
          <p className="font-cormorant italic text-[#C9995F] text-xl sm:text-2xl tracking-wider tabular-nums">
            {EVENT_DATE_DISPLAY}
          </p>
        </motion.div>
      </div>

      {/* bottom ornamental line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  )
}
