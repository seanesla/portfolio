import AboutMoment from './life/AboutMoment'
import TravelGallery from './life/TravelGallery'
import KeyboardShowcase from './life/KeyboardShowcase'

export default function LifeSection() {
  return (
    <section className="life-section relative z-10">
      <AboutMoment />
      <TravelGallery />
      <KeyboardShowcase />
    </section>
  )
}
