import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AboutChapter, { type AboutChapterRefs } from './chapters/AboutChapter'
import TravelChapter, { type TravelChapterRefs } from './chapters/TravelChapter'
import { useIsMobile } from '../../hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

// Chapter progress ranges (must match timeline animations below)
const CHAPTER_RANGES = {
  about:  { start: 0.05, end: 0.48 },
  travel: { start: 0.55, end: 0.95 },
} as const

// Mid-points for navbar scroll-to (exported for Navbar)
export const CHAPTER_MID_PROGRESS = {
  about: 0.27,
  travel: 0.75,
} as const

export default function LifeChapters() {
  const isMobile = useIsMobile()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<AboutChapterRefs>(null)
  const travelRef = useRef<TravelChapterRefs>(null)

  // Chapter layer refs for cross-fade transitions
  const aboutLayerRef = useRef<HTMLDivElement>(null)
  const travelLayerRef = useRef<HTMLDivElement>(null)

  // Dot element refs
  const dot0Ref = useRef<HTMLDivElement>(null)
  const dot1Ref = useRef<HTMLDivElement>(null)

  const [holdActive, setHoldActive] = useState(false)
  const [travelActive, setTravelActive] = useState(false)
  const holdTriggeredRef = useRef(false)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const frame = frameRef.current
    const dots = dotsRef.current
    const about = aboutRef.current
    const travel = travelRef.current
    const aboutLayer = aboutLayerRef.current
    const travelLayer = travelLayerRef.current

    if (!wrapper || !frame || !dots || !about?.photo || !about?.card ||
        !travel?.heading || !travel?.galleryWrap ||
        !aboutLayer || !travelLayer) return

    const totalScroll = isMobile ? 1200 : 1800

    const ctx = gsap.context(() => {
      // ── Initial states ──
      gsap.set(frame, { opacity: 0 })
      gsap.set(dots, { opacity: 0 })

      // About
      gsap.set(about.photo, { x: isMobile ? -60 : -120, rotateZ: -3, opacity: 0 })
      gsap.set(about.card, { x: isMobile ? 60 : 120, rotateZ: 2, opacity: 0 })
      gsap.set(aboutLayer, { opacity: 1 })

      // Travel (hidden initially)
      gsap.set(travelLayer, { opacity: 0 })
      gsap.set(travel.heading, { y: -40, filter: 'blur(8px)', opacity: 0 })
      gsap.set(travel.galleryWrap, { y: 60, scale: 0.95, opacity: 0 })

      // ── Timeline ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: `+=${totalScroll}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress

            // Terminal hold trigger (one-shot)
            if (p >= 0.15 && !holdTriggeredRef.current) {
              holdTriggeredRef.current = true
              setHoldActive(true)
            }

            // Travel active (for pointer events)
            const inTravel = p >= CHAPTER_RANGES.travel.start && p <= CHAPTER_RANGES.travel.end
            setTravelActive(inTravel)

            // ── Dot indicator (direct DOM for perf) ──
            const d0 = dot0Ref.current
            const d1 = dot1Ref.current
            if (d0 && d1) {
              const activeDot = p < 0.52 ? 0 : 1
              ;[d0, d1].forEach((d, i) => {
                const isActive = i === activeDot
                d.style.background = isActive
                  ? 'rgba(140,180,255,0.85)'
                  : 'rgba(255,255,255,0.15)'
                d.style.transform = isActive ? 'scale(1.3)' : 'scale(1)'
                d.style.boxShadow = isActive
                  ? '0 0 8px rgba(140,180,255,0.4)'
                  : 'none'
              })
            }
          },
          onToggle: (self) => {
            // Play/pause about video
            const video = about.video
            if (!video) return
            if (self.isActive) video.play().catch(() => {})
            else video.pause()
          },
        },
      })

      // ── Frame fade in (0.00–0.05) ──
      tl.to(frame, { opacity: 1, duration: 0.05, ease: 'power2.out' }, 0)
      tl.to(dots, { opacity: 1, duration: 0.05, ease: 'power2.out' }, 0)

      // ══════════════════════════════════
      // CHAPTER 1: ABOUT (0.05–0.48)
      // ══════════════════════════════════

      // Enter (0.05–0.15)
      tl.to(about.photo, { x: 0, rotateZ: 0, opacity: 1, duration: 0.10, ease: 'power2.out' }, 0.05)
      tl.to(about.card, { x: 0, rotateZ: 0, opacity: 1, duration: 0.10, ease: 'power2.out' }, 0.06)

      // Hold (0.15–0.38) — terminal typing (time-based via holdActive)

      // Exit (0.38–0.48)
      tl.to(about.photo, { y: -40, opacity: 0, duration: 0.10, ease: 'power2.in' }, 0.38)
      tl.to(about.card, { y: 40, opacity: 0, duration: 0.10, ease: 'power2.in' }, 0.38)

      // ── Transition 1→2: Perspective slide (0.48–0.55) ──
      if (!isMobile) {
        tl.to(aboutLayer, {
          x: -80, rotateY: -8, opacity: 0,
          transformPerspective: 800,
          duration: 0.07, ease: 'power2.in',
        }, 0.48)
        tl.fromTo(travelLayer,
          { x: 80, rotateY: 8, opacity: 0, transformPerspective: 800 },
          { x: 0, rotateY: 0, opacity: 1, transformPerspective: 800, duration: 0.07, ease: 'power2.out' },
          0.48
        )
      } else {
        // Simple crossfade on mobile
        tl.to(aboutLayer, { opacity: 0, duration: 0.07 }, 0.48)
        tl.to(travelLayer, { opacity: 1, duration: 0.07 }, 0.48)
      }

      // ══════════════════════════════════
      // CHAPTER 2: TRAVEL (0.55–0.95)
      // ══════════════════════════════════

      // Enter (0.55–0.65)
      tl.to(travel.heading, { y: 0, filter: 'blur(0px)', opacity: 1, duration: 0.10 }, 0.55)
      tl.to(travel.galleryWrap, { y: 0, scale: 1, opacity: 1, duration: 0.10, ease: 'power2.out' }, 0.56)

      // Hold (0.65–0.85) — user interacts with hover gallery

      // Exit (0.85–0.95)
      tl.to(travel.galleryWrap, { y: -30, opacity: 0, duration: 0.10, ease: 'power2.in' }, 0.85)
      tl.to(travel.heading, { filter: 'blur(6px)', opacity: 0, duration: 0.06 }, 0.89)

      // ── Frame fade out (0.95–1.00) ──
      tl.to(frame, { opacity: 0, duration: 0.05, ease: 'power2.in' }, 0.95)
      tl.to(dots, { opacity: 0, duration: 0.05, ease: 'power2.in' }, 0.95)
    }, wrapperRef)

    return () => ctx.revert()
  }, [isMobile])

  return (
    <div ref={wrapperRef} data-nav-id="life" className="relative h-[1px] overflow-visible">
      <div className="h-screen relative z-[2]">
        {/* Glass frame */}
        <div
          ref={frameRef}
          className="absolute inset-3 md:inset-6 pointer-events-none"
          style={{
            borderRadius: isMobile ? 12 : 20,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 0 40px rgba(140, 180, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
            background: 'transparent',
          }}
        />

        {/* Dot indicator */}
        <div
          ref={dotsRef}
          className={`absolute z-[10] ${
            isMobile
              ? 'bottom-5 left-1/2 -translate-x-1/2 flex-row'
              : 'right-8 top-1/2 -translate-y-1/2 flex-col'
          } flex gap-3`}
        >
          {[dot0Ref, dot1Ref].map((dotRef, i) => (
            <div
              key={i}
              ref={dotRef}
              className="w-[7px] h-[7px] rounded-full transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>

        {/* Chapter layers — stacked absolutely */}
        <div
          ref={aboutLayerRef}
          data-nav-id="about"
          className="absolute inset-0"
        >
          <AboutChapter ref={aboutRef} holdActive={holdActive} />
        </div>

        <div
          ref={travelLayerRef}
          data-nav-id="travel"
          className="absolute inset-0"
        >
          <TravelChapter ref={travelRef} active={travelActive} />
        </div>
      </div>
    </div>
  )
}
