import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WaveBackground from './components/ui/WaveBackground'
import Particles from './components/ui/Particles'
import IntroAnimation from './components/IntroAnimation'
import HeroSection from './components/HeroSection'
import LifeSection from './components/LifeSection'
import ProjectsSection from './components/ProjectsSection'
import TheEndSection from './components/TheEndSection'
import PaperAirplane from './components/PaperAirplane'
import Navbar from './components/Navbar'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const [heroVisible, setHeroVisible] = useState(true)
  const [particlesPaused, setParticlesPaused] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const lifeRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const galaxyRef = useRef<HTMLDivElement>(null)
  const voidRef = useRef<HTMLDivElement>(null)

  // Lock scroll during intro so user can't scroll before animations are ready
  useEffect(() => {
    if (!introComplete) {
      document.body.style.overflowY = 'hidden'
    } else {
      document.body.style.overflowY = ''
    }
    return () => { document.body.style.overflowY = '' }
  }, [introComplete])

  // Create hero pin in useLayoutEffect so it runs BEFORE child useEffect callbacks.
  // This guarantees the hero pin spacer exists in the DOM when LifeSection's
  // ScrollTriggers calculate their positions.
  useLayoutEffect(() => {
    if (!introComplete) return

    const ctx = gsap.context(() => {
      // --- Hero → Life: Iris Wipe ---
      const irisWipe = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: () => '+=' + window.innerHeight,
          pin: true,
          scrub: 0.5,
          snap: { snapTo: [0, 1], duration: { min: 0.2, max: 0.4 }, delay: 0.1, ease: 'power1.inOut' },
          onLeave: () => {
            if (lifeRef.current) {
              lifeRef.current.style.clipPath = 'none'
              lifeRef.current.style.willChange = 'auto'
            }
            setHeroVisible(false)
          },
          onEnterBack: () => {
            if (lifeRef.current) {
              lifeRef.current.style.willChange = 'clip-path'
            }
            setHeroVisible(true)
            // Reset Magnet transforms on the scroll indicator so it doesn't appear shifted
            const indicator = document.querySelector('.hero-scroll-indicator')
            if (indicator?.parentElement) {
              gsap.set(indicator.parentElement, { x: 0, y: 0 })
            }
          },
        },
      })

      irisWipe
        .to('.hero-content', { opacity: 0, scale: 0.95, duration: 0.5 })
        .fromTo(
          lifeRef.current,
          { clipPath: 'circle(0% at 50% 50%)' },
          { clipPath: 'circle(150% at 50% 50%)', duration: 1 },
          0.2
        )

      // --- Fade out Galaxy when scrolling past hero ---
      if (galaxyRef.current) {
        gsap.to(galaxyRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: () => '+=' + window.innerHeight,
            scrub: 0.5,
          },
        })
      }

      // --- Fade particles IN when scrolling past hero (hidden during hero) ---
      if (particlesRef.current) {
        gsap.fromTo(particlesRef.current,
          { opacity: 0 },
          {
            opacity: 0.3,
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: () => '+=' + window.innerHeight,
              scrub: 0.5,
              onEnter: () => setParticlesPaused(false),
              onLeaveBack: () => setParticlesPaused(true),
            },
          }
        )
      }

      // --- Fade particles OUT near the end section for a deeper void effect ---
      const endSection = document.querySelector('[data-end-section]')
      if (endSection && particlesRef.current) {
        gsap.to(particlesRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: endSection,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.5,
            onLeave: () => setParticlesPaused(true),
            onEnterBack: () => setParticlesPaused(false),
          },
        })
      }

      // --- Void overlay: fade background layers to black as TheEnd approaches ---
      if (endSection && voidRef.current) {
        gsap.to(voidRef.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: endSection,
            start: 'top 100%',
            end: 'top 30%',
            scrub: 0.5,
          },
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [introComplete])

  // Safety net: refresh ScrollTrigger positions after all pin spacers are created
  useEffect(() => {
    if (!introComplete) return
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [introComplete])

  return (
    <>
      <IntroAnimation onComplete={() => setIntroComplete(true)} />

      {/* Particles — hidden in hero, fades in when scrolling to life sections */}
      <div ref={particlesRef} className="fixed inset-0 z-[1] pointer-events-none" style={{ opacity: 0 }}>
        <Particles
          particleCount={500}
          moveParticlesOnHover={false}
          paused={particlesPaused}
          className="w-full h-full"
        />
      </div>

      {/* Void overlay — fades body bg to black as TheEnd section approaches */}
      <div ref={voidRef} className="fixed inset-0 z-0 pointer-events-none bg-black" style={{ opacity: 0 }} />

      {/* Wave — animated blue wave shader, visible in hero, fades out on scroll */}
      <div ref={galaxyRef} className="fixed inset-0 z-[1] pointer-events-none">
        <WaveBackground paused={!heroVisible} />
      </div>

      <PaperAirplane started={introComplete} />

      <div ref={containerRef} className="relative z-[2]">
        <div ref={heroRef} className="h-[1px] overflow-visible">
          <HeroSection visible={introComplete} />
        </div>

        {introComplete && (
          <div ref={lifeRef} style={{ clipPath: 'circle(0% at 50% 50%)' }}>
            <LifeSection />
            <ProjectsSection />
            <TheEndSection />
          </div>
        )}
      </div>

      <Navbar visible={introComplete} />

    </>
  )
}
