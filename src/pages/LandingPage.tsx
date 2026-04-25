import { HeroSection } from './landing/sections/HeroSection'
import { ShowcaseSection } from './landing/sections/ShowcaseSection'
import { DifferentiatorsSection } from './landing/sections/DifferentiatorsSection'
import { DevicesSection } from './landing/sections/DevicesSection'
import { PricingSection } from './landing/sections/PricingSection'
import { FinalCtaSection } from './landing/sections/FinalCtaSection'
import { LandingFooter } from './landing/components/LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <HeroSection />
      <div className="cv-auto">
        <ShowcaseSection />
      </div>
      <div className="cv-auto">
        <DifferentiatorsSection />
      </div>
      <div className="cv-auto">
        <DevicesSection />
      </div>
      <div className="cv-auto">
        <PricingSection />
      </div>
      <div className="cv-auto">
        <FinalCtaSection />
      </div>
      <LandingFooter />
    </div>
  )
}
