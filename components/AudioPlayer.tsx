'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { VolumeX } from 'lucide-react'

const EQUALIZER_BARS = [0, 1, 2, 3]
const INTRO_SKIP_SECONDS = 9

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Skip the first 10s of the track. Set on 'loadedmetadata' rather than
    // immediately — currentTime writes are ignored/unreliable before the
    // browser knows the track's duration.
    const skipIntro = () => {
      if (audio.currentTime < INTRO_SKIP_SECONDS) audio.currentTime = INTRO_SKIP_SECONDS
    }
    if (audio.readyState >= 1) skipIntro()
    else audio.addEventListener('loadedmetadata', skipIntro, { once: true })

    // no native `loop` attribute — looping natively would replay the
    // skipped intro every time, so restart from the same offset instead
    const onEnded = () => {
      audio.currentTime = INTRO_SKIP_SECONDS
      audio.play().catch(() => {})
    }
    audio.addEventListener('ended', onEnded)

    // autoplay blocked — resume on the first user interaction
    const resume = () => {
      audio.play().catch(() => {})
    }

    audio.play().catch(() => {
      window.addEventListener('click', resume, { once: true })
      window.addEventListener('touchstart', resume, { once: true })
      window.addEventListener('scroll', resume, { once: true })
    })

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      window.removeEventListener('click', resume)
      window.removeEventListener('touchstart', resume)
      window.removeEventListener('scroll', resume)
      audio.removeEventListener('loadedmetadata', skipIntro)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/bg-music.mp3" preload="auto" />

      <motion.button
        onClick={toggle}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? 'Կանգնեցնել երաժշտությունը' : 'Միացնել երաժշտությունը'}
        className="fixed z-50 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 w-12 h-12 rounded-full bg-ivory/40 backdrop-blur-md border border-gold/40 shadow-lg flex items-center justify-center transition-colors duration-300 hover:bg-ivory/60"
      >
        {isPlaying ? (
          <div className="flex items-end gap-[3px] h-4">
            {EQUALIZER_BARS.map(i => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-gold-dark"
                animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
                transition={{
                  duration: 0.9 + i * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        ) : (
          <VolumeX className="w-5 h-5 text-gold-dark" />
        )}
      </motion.button>
    </>
  )
}
