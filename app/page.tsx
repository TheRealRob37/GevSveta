'use client'

import HeroSection    from '@/components/HeroSection'
import WelcomeSection from '@/components/WelcomeSection'
import ScheduleSection from '@/components/ScheduleSection'
import RSVPSection    from '@/components/RSVPSection'
import FooterSection  from '@/components/FooterSection'

export default function EngagementPage() {
  return (
    <main className="min-h-screen bg-ivory overflow-x-hidden">
      <HeroSection />
      <WelcomeSection />
      <ScheduleSection />
      <RSVPSection />
      <FooterSection />
    </main>
  )
}
