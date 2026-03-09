import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BlurText from './ui/BlurText'
import DecryptedText from './ui/DecryptedText'
import ProjectCard from './projects/ProjectCard'
import ProjectMedia from './projects/ProjectMedia'
import { PROJECTS } from './projects/projectData'
import { useIsMobile } from '../hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

const CARD_COUNT = PROJECTS.length

export default function ProjectsSection() {
  const isMobile = useIsMobile()
  const scrollPerCard = isMobile ? 500 : 800
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const mobileIndicatorRef = useRef<HTMLDivElement>(null)
  const mobileFillRef = useRef<HTMLDivElement>(null)
  const activeIdxRef = useRef(-1)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    if (!section) return

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[]
    if (cards.length === 0) return

    const ctx = gsap.context(() => {
      // Initial states: title hidden, all cards below viewport
      if (title) {
        gsap.set(title, { opacity: 0, y: 30 })
      }
      cards.forEach((card) => {
        gsap.set(card, { yPercent: 100, opacity: 1, transformOrigin: 'center bottom' })
      })

      const totalScroll = scrollPerCard * CARD_COUNT + 400

      // Card phase timing (declared early for onUpdate)
      const cardStart = 0.10
      const cardRange = 0.88 - cardStart
      const perCard = cardRange / CARD_COUNT

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${totalScroll}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress

            // Discrete index for React state
            const idx = p >= cardStart
              ? Math.min(Math.floor((p - cardStart) / perCard), CARD_COUNT - 1)
              : -1
            if (idx !== activeIdxRef.current) {
              activeIdxRef.current = idx
              setActiveIndex(idx)
            }

            // Continuous fill for direct DOM updates (no re-renders)
            const fillPct = Math.max(0, Math.min(1, (p - cardStart) / cardRange))
            if (fillRef.current) fillRef.current.style.height = `${fillPct * 100}%`
            if (dotRef.current) dotRef.current.style.top = `${fillPct * 100}%`
            if (mobileFillRef.current) mobileFillRef.current.style.width = `${fillPct * 100}%`
          },
        },
      })

      // Title phase: 0.00–0.06 fade in, 0.06–0.12 fade out
      const titleInEnd = 0.06
      const titleOutEnd = 0.12

      if (title) {
        tl.to(title, { opacity: 1, y: 0, duration: titleInEnd, ease: 'power2.out' }, 0)
        tl.to(title, { opacity: 0, y: -20, duration: titleOutEnd - titleInEnd, ease: 'power2.in' }, titleInEnd)
      }

      // Card phases

      cards.forEach((card, i) => {
        const enter = cardStart + i * perCard
        const enterEnd = enter + perCard * 0.25

        // Slide card up into view
        tl.to(card, {
          yPercent: 0,
          duration: enterEnd - enter,
          ease: 'power2.out',
        }, enter)

        // Scale down + shift previous cards behind
        for (let j = 0; j < i; j++) {
          const depth = i - j
          const targetScale = 1 - depth * 0.03
          const targetY = -depth * 28

          tl.to(cards[j], {
            scale: targetScale,
            y: targetY,
            duration: enterEnd - enter,
            ease: 'power2.out',
          }, enter)
        }
      })

      // Exit: fade out ALL cards (not just the last one, so stacked cards don't bleed into the next section)
      const exitStart = 0.92
      cards.forEach((card) => {
        tl.to(card, {
          opacity: 0,
          scale: 0.95,
          duration: 1 - exitStart,
          ease: 'power2.in',
        }, exitStart)
      })

      // Desktop panel fade in/out
      const panel = panelRef.current
      if (panel) {
        gsap.set(panel, { opacity: 0 })
        tl.to(panel, { opacity: 1, duration: 0.04 }, cardStart)
        tl.to(panel, { opacity: 0, duration: 0.06 }, exitStart)
      }

      // Media showcase fade in/out
      const media = mediaRef.current
      if (media) {
        gsap.set(media, { opacity: 0 })
        tl.to(media, { opacity: 1, duration: 0.04 }, cardStart)
        tl.to(media, { opacity: 0, duration: 0.06 }, exitStart)
      }

      // Mobile indicator fade in/out
      const mobileInd = mobileIndicatorRef.current
      if (mobileInd) {
        gsap.set(mobileInd, { opacity: 0 })
        tl.to(mobileInd, { opacity: 1, duration: 0.04 }, cardStart)
        tl.to(mobileInd, { opacity: 0, duration: 0.06 }, exitStart)
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [scrollPerCard])

  const currentProject = activeIndex >= 0 ? PROJECTS[activeIndex] : null

  return (
    <div ref={sectionRef} data-nav-id="projects" className="relative h-[1px] overflow-visible">
      <div className="h-screen flex items-end justify-center pb-10 relative">
        {/* Section title */}
        <div ref={titleRef} className="absolute inset-0 flex flex-col items-center justify-center z-[10] pointer-events-none">
          <BlurText
            text="projects"
            className="text-[clamp(2rem,5vw,3.5rem)] font-extralight tracking-wide text-white/90"
            animate={false}
          />
        </div>

        {/* Media showcase — upper portion of viewport */}
        <div
          ref={mediaRef}
          className="absolute top-4 left-0 right-0 z-[5] pointer-events-none flex items-center justify-center"
          style={{ height: isMobile ? '45vh' : '50vh' }}
        >
          {currentProject?.media && (
            <ProjectMedia key={activeIndex} project={currentProject} />
          )}
        </div>

        {/* Stacking cards */}
        {PROJECTS.map((project, i) => (
          <div
            key={project.id}
            ref={(el) => { cardsRef.current[i] = el }}
            className="absolute inset-0 flex items-end justify-center pb-6 md:pb-10"
            style={{ zIndex: i + 1 }}
          >
            <div className="w-full max-w-[1100px] px-6">
              <ProjectCard project={project} />
            </div>
          </div>
        ))}

        {/* Desktop progress panel — left gutter */}
        <div
          ref={panelRef}
          className="absolute left-6 lg:left-10 xl:left-16 top-1/2 -translate-y-1/2 z-[10] hidden lg:flex items-center gap-5"
        >
          {/* Rail container */}
          <div className="relative flex flex-col items-center" style={{ height: 280 }}>
            {/* Top number */}
            <span className="text-[0.6rem] tracking-[0.15em] text-white/25 font-light tabular-nums mb-2">
              01
            </span>

            {/* Rail track */}
            <div className="relative flex-1 w-px">
              {/* Background track */}
              <div className="absolute inset-0 bg-white/[0.06] rounded-full" />

              {/* Fill */}
              <div
                ref={fillRef}
                className="absolute top-0 left-0 w-full rounded-full"
                style={{
                  height: '0%',
                  background: 'linear-gradient(to bottom, rgba(140,180,255,0.1), rgba(140,180,255,0.35))',
                }}
              />

              {/* Glow dot */}
              <div
                ref={dotRef}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: '0%' }}
              >
                <div
                  className="w-[7px] h-[7px] rounded-full bg-[rgba(140,180,255,0.85)]"
                  style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
                />
              </div>
            </div>

            {/* Bottom number */}
            <span className="text-[0.6rem] tracking-[0.15em] text-white/25 font-light tabular-nums mt-2">
              {String(CARD_COUNT).padStart(2, '0')}
            </span>
          </div>

          {/* Project info column — xl+ only */}
          <div className="hidden xl:flex flex-col gap-1.5 min-w-[160px]">
            {/* Counter */}
            <span className="text-[0.55rem] tracking-[0.2em] uppercase text-white/20 font-light tabular-nums">
              project
            </span>

            {/* Project name with scramble animation */}
            {currentProject && (
              <DecryptedText
                key={activeIndex}
                text={currentProject.name}
                speed={60}
                revealDirection="start"
                className="text-[0.85rem] tracking-[0.08em] text-white/70 font-light"
              />
            )}

            {/* Winner badge */}
            {currentProject?.isWinner && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-amber-400/80 text-[0.7rem]">★</span>
                <span className="text-[0.55rem] tracking-[0.1em] uppercase text-amber-400/60 font-light">
                  {currentProject.award}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile progress indicator — bottom center */}
        <div
          ref={mobileIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10] flex lg:hidden flex-col items-center gap-2"
        >
          {/* Counter */}
          <span className="text-[0.7rem] tracking-[0.15em] text-white/30 font-light tabular-nums">
            {String(Math.max(activeIndex + 1, 1)).padStart(2, '0')}/{String(CARD_COUNT).padStart(2, '0')}
          </span>

          {/* Horizontal bar */}
          <div className="relative w-[120px] h-px">
            <div className="absolute inset-0 bg-white/[0.06] rounded-full" />
            <div
              ref={mobileFillRef}
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: '0%',
                background: 'linear-gradient(to right, rgba(140,180,255,0.15), rgba(140,180,255,0.4))',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
