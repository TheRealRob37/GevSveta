'use client'

import { motion } from 'framer-motion'

export default function FooterSection() {
  return (
    <footer className="relative bg-charcoal py-16 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative font-cormorant italic text-ivory text-2xl sm:text-3xl text-center px-6"
      >
        Սիրով սպասում ենք Ձեզ
      </motion.p>
    </footer>
  )
}
