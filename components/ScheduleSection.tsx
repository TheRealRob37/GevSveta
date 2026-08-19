'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { MapPin, Clock, Map } from 'lucide-react'
import { VENUE_NAME, VENUE_MAP_URL, VENUE_TIME } from '@/lib/constants'

function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: threshold })
  return { ref, inView }
}

const EVENT = {
  time:    VENUE_TIME,
  title:   VENUE_NAME,
  note:    'Տոնական երեկո, ջերմ մթնոլորտ և բարձր տրամադրություն',
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
          <h2 className="font-playfair text-4xl sm:text-5xl text-charcoal mb-6">
            Հանդիսավոր Ընթրիք
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
          <div className="flex-1 card-elegant rounded-2xl shadow-md border border-amber-200/40 p-7 sm:p-8 flex flex-col items-center text-center">
            <h3 className="flex items-center justify-center gap-1.5 font-playfair text-xl sm:text-2xl text-charcoal mb-2 leading-snug">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
              {EVENT.title}
            </h3>
            <p className="font-cormorant italic text-charcoal-light text-base mb-4 leading-relaxed max-w-xs">
              {EVENT.note}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-charcoal mb-5">
              <Clock className="w-4 h-4 text-gold-dark flex-shrink-0" />
              <span className="font-lato text-base font-bold">Ժամը {EVENT.time}-ին</span>
            </div>

            <a
              href={EVENT.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-lato font-semibold tracking-wider uppercase rounded-full px-5 py-2.5 transition-all duration-300 bg-gold/15 text-gold-dark hover:bg-gold hover:text-charcoal shadow-sm"
            >
              <Map className="w-3.5 h-3.5" />
              Բացել Քարտեզում
            </a>
          </div>

          {/* calendar card */}
          <CalendarCard />
        </motion.div>
      </div>
    </section>
  )
}
