'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { UtensilsCrossed, MapPin, Clock, ExternalLink } from 'lucide-react'
import { VENUE_NAME, VENUE_ADDRESS, VENUE_MAP_URL, VENUE_TIME } from '@/lib/constants'

function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: threshold })
  return { ref, inView }
}

const EVENT = {
  icon:    UtensilsCrossed,
  time:    VENUE_TIME,
  label:   'Ընթրիք',
  title:   VENUE_NAME,
  address: VENUE_ADDRESS,
  note:    'Ընթրիք, պար եւ տոնախմբություն',
  mapUrl:  VENUE_MAP_URL,
}

const WEEKDAYS = ['ԵՐԿ', 'ԵՐՔ', 'ՉՈՐ', 'ՀՆԳ', 'ՈՒՐԲ', 'ՇԲԹ', 'ԿԻՐ']
const HIGHLIGHT_DAY = 7

// Week starts Monday. Nov 1, 2026 is a Sunday, so it falls in the last column.
const NOVEMBER_2026_DAYS: (number | null)[] = [
  null, null, null, null, null, null, 1, // Week 1 (Nov 1 is Sunday)
  2, 3, 4, 5, 6, 7, 8,                    // Week 2 (Nov 7 is Saturday)
  9, 10, 11, 12, 13, 14, 15,              // Week 3
  16, 17, 18, 19, 20, 21, 22,             // Week 4
  23, 24, 25, 26, 27, 28, 29,             // Week 5
  30,                                      // Week 6
]

function CalendarCard() {
  return (
    <div className="relative flex-1 w-full card-elegant border-gold/30 border p-7 sm:p-8 overflow-hidden">
      {/* subtle linen backdrop */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FFE4C4 0, #FFE4C4 1px, transparent 0, transparent 50%)`,
          backgroundSize: '14px 14px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 0%, #FFE4C4 0%, transparent 65%)' }}
      />

      <div className="relative">
        <p className="text-center font-playfair text-lg sm:text-xl text-charcoal mb-6">
          Նոյեմբեր 2026
        </p>

        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center font-lato font-light text-[9px] tracking-[0.25em] uppercase text-gold-dark">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {NOVEMBER_2026_DAYS.map((day, i) => (
            <div key={i} className="aspect-square flex items-center justify-center">
              {day === null ? null : day === HIGHLIGHT_DAY ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gold/25 flex items-center justify-center">
                  <span className="font-playfair text-[11px] sm:text-xs text-charcoal font-semibold leading-none">
                    {day}
                  </span>
                </div>
              ) : (
                <span className="font-lato text-xs sm:text-sm text-charcoal-light">{day}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ScheduleSection() {
  const { ref: titleRef, inView: titleInView } = useReveal()
  const { ref: eventRef, inView: eventInView } = useReveal()
  const Icon = EVENT.icon

  return (
    <section className="relative py-24 sm:py-32 bg-ivory-dark overflow-hidden">

      {/* background texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg, #C9A96E 0, #C9A96E 1px, transparent 0, transparent 50%
          )`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6">

        {/* heading */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="font-lato text-xs tracking-[0.4em] uppercase text-gold-dark">
            Ծրագիր
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl text-charcoal mt-3 mb-6">
            Տոնի Ժամանակացույց
          </h2>
          <div className="w-16 h-px bg-gold/40 mx-auto" />
        </motion.div>

        {/* venue + calendar, side by side */}
        <motion.div
          ref={eventRef}
          initial={{ opacity: 0, y: 30 }}
          animate={eventInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-stretch gap-6"
        >
          {/* venue card */}
          <div className="flex-1 card-elegant border-gold/30 border p-7 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gold/10 text-gold-dark">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-lato text-[11px] tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-gold/10 text-gold-dark">
                  {EVENT.label}
                </span>
                <h3 className="font-playfair text-xl sm:text-2xl text-charcoal mt-2 mb-1 leading-snug">
                  {EVENT.title}
                </h3>
                <p className="font-cormorant italic text-charcoal-light text-base mb-1">
                  {EVENT.note}
                </p>

                <div className="flex items-center gap-1.5 text-charcoal-light text-sm mt-3 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="font-lato text-xs">{EVENT.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-light mb-4">
                  <Clock className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="font-lato text-xs">Ժամը {EVENT.time}-ին</span>
                </div>

                <a
                  href={EVENT.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-lato tracking-wider uppercase border rounded-full px-4 py-2 transition-all duration-300 border-gold/40 text-gold-dark hover:bg-gold hover:text-charcoal hover:border-gold"
                >
                  <ExternalLink className="w-3 h-3" />
                  Բացել Քարտեզում
                </a>
              </div>
            </div>
          </div>

          {/* calendar card */}
          <CalendarCard />
        </motion.div>
      </div>
    </section>
  )
}
