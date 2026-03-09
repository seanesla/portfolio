import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlassSurface from './ui/GlassSurface'
import { CHAPTER_MID_PROGRESS } from './life/LifeChapters'

interface Props {
  visible: boolean
}

const NAV_LINKS = [
  { label: 'About', navId: 'about' },
  { label: 'Travel', navId: 'travel' },
  { label: 'Projects', navId: 'projects' },
]

// Sub-chapter navIds that live inside the single "life" ScrollTrigger
const LIFE_CHAPTERS: Record<string, number> = {
  about: CHAPTER_MID_PROGRESS.about,
  travel: CHAPTER_MID_PROGRESS.travel,
}

export default function Navbar({ visible }: Props) {
  const navRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [activeNav, setActiveNav] = useState<string | null>(null)
  const [atEnd, setAtEnd] = useState(false)
  const backBtnRef = useRef<HTMLButtonElement>(null)
  const prevNavRef = useRef<string | null>(null)

  // Fade in on first appearance
  useEffect(() => {
    if (!visible || !navRef.current) return
    gsap.fromTo(navRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
  }, [visible])

  // Combined scroll handler: track active section + end section
  const activeNavRef = useRef<string | null>(null)
  const atEndRef = useRef(false)
  const cachedTriggersRef = useRef<{ navId: string; st: ScrollTrigger }[]>([])
  const endSectionRef = useRef<Element | null>(null)
  const rafPendingRef = useRef(false)

  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      // Cache the "life" ScrollTrigger (single pin for all life chapters)
      // and the "projects" ScrollTrigger (its own pin)
      const lifeEl = document.querySelector('[data-nav-id="life"]')
      const lifeST = lifeEl ? ScrollTrigger.getAll().find(t => t.trigger === lifeEl) : undefined

      const projectsEl = document.querySelector('[data-nav-id="projects"]')
      const projectsST = projectsEl ? ScrollTrigger.getAll().find(t => t.trigger === projectsEl) : undefined

      // Build cached triggers for non-life sections
      cachedTriggersRef.current = []
      if (projectsST) cachedTriggersRef.current.push({ navId: 'projects', st: projectsST })

      endSectionRef.current = document.querySelector('[data-end-section]')

      const onScroll = () => {
        if (rafPendingRef.current) return
        rafPendingRef.current = true
        requestAnimationFrame(() => {
          rafPendingRef.current = false

          const scrollY = window.scrollY
          const vh = window.innerHeight
          let active: string | null = null

          // Check life chapters via progress within the single life ScrollTrigger
          if (lifeST && scrollY >= lifeST.start - vh * 0.3 && scrollY <= lifeST.end + vh * 0.1) {
            const p = lifeST.progress
            if (p < 0.52) active = 'about'
            else active = 'travel'
          }

          // Check other sections (projects)
          if (!active) {
            for (const { navId, st } of cachedTriggersRef.current) {
              if (scrollY >= st.start - vh * 0.3 && scrollY <= st.end + vh * 0.1) {
                active = navId
              }
            }
          }

          if (active !== activeNavRef.current) {
            activeNavRef.current = active
            setActiveNav(active)
          }

          // End section
          const endEl = endSectionRef.current
          if (endEl) {
            const rect = endEl.getBoundingClientRect()
            const isAtEnd = rect.top < vh * 0.5
            if (isAtEnd !== atEndRef.current) {
              atEndRef.current = isAtEnd
              setAtEnd(isAtEnd)
            }
          }
        })
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()

      return () => window.removeEventListener('scroll', onScroll)
    }, 500)

    return () => clearTimeout(timer)
  }, [visible])

  // Animate pill to active button with liquid/bouncy effect
  const animatePill = useCallback(() => {
    const pill = pillRef.current
    if (!pill) return

    if (!activeNav) {
      // No active section — fade pill out
      gsap.to(pill, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' })
      prevNavRef.current = null
      return
    }

    const idx = NAV_LINKS.findIndex(l => l.navId === activeNav)
    const btn = btnRefs.current[idx]
    if (!btn || !btn.parentElement) return

    const parentRect = btn.parentElement.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    const targetX = btnRect.left - parentRect.left
    const targetW = btnRect.width
    const targetH = btnRect.height

    const isFirst = prevNavRef.current === null
    prevNavRef.current = activeNav

    if (isFirst) {
      // First appearance — pop in
      gsap.set(pill, { x: targetX, width: targetW, height: targetH, opacity: 0, scale: 0.5 })
      gsap.to(pill, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(3)',
      })
      return
    }

    // Liquid jello bounce to new position
    // First: squish horizontally in the direction of movement
    const currentX = gsap.getProperty(pill, 'x') as number
    const movingRight = targetX > currentX

    const tl = gsap.timeline()

    // Phase 1: stretch toward target (liquid stretch)
    tl.to(pill, {
      x: movingRight ? targetX - 4 : targetX + 4,
      width: targetW + 8,
      scaleY: 0.85,
      duration: 0.25,
      ease: 'power2.in',
    })

    // Phase 2: snap to target with overshoot + jello wobble
    tl.to(pill, {
      x: targetX,
      width: targetW,
      height: targetH,
      scaleY: 1,
      scaleX: 1,
      duration: 0.5,
      ease: 'elastic.out(1.2, 0.4)',
    })
  }, [activeNav])

  useEffect(() => {
    animatePill()
  }, [animatePill])

  const handleNavClick = (navId: string) => {
    // Life sub-chapters: scroll to the correct position within the single "life" pin
    if (navId in LIFE_CHAPTERS) {
      const lifeEl = document.querySelector('[data-nav-id="life"]')
      if (!lifeEl) return
      const st = ScrollTrigger.getAll().find(t => t.trigger === lifeEl)
      if (st) {
        const target = st.start + (st.end - st.start) * LIFE_CHAPTERS[navId]
        window.scrollTo({ top: target, behavior: 'smooth' })
      }
      return
    }

    // Other sections (projects, etc.)
    const triggerEl = document.querySelector(`[data-nav-id="${navId}"]`)
    if (!triggerEl) return
    const st = ScrollTrigger.getAll().find(t => t.trigger === triggerEl)
    if (st) {
      const target = st.start + (st.end - st.start) * 0.5
      window.scrollTo({ top: target, behavior: 'smooth' })
    }
  }

  if (!visible) return null

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex justify-center pointer-events-none">
    <div
      ref={navRef}
      className="pointer-events-auto max-w-[calc(100vw-2rem)]"
    >
      <GlassSurface
        width="auto"
        height={46}
        borderRadius={14}
        blur={15}
        brightness={40}
        opacity={0.85}
        backgroundOpacity={0.15}
        saturation={1.2}
        distortionScale={-120}
        redOffset={0}
        greenOffset={6}
        blueOffset={12}
        style={{ width: 'auto' }}
      >
        <nav className="relative flex items-center gap-1 px-2 overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {/* Animated pill indicator */}
          <div
            ref={pillRef}
            className="absolute top-0 left-0 rounded-[10px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, rgba(140,180,255,0.18), rgba(140,180,255,0.08))',
              border: '1px solid rgba(140,180,255,0.12)',
              boxShadow: '0 0 12px rgba(140,180,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
              opacity: 0,
              transformOrigin: 'center center',
            }}
          />
          {NAV_LINKS.map((link, i) => (
            <button
              key={link.label}
              ref={(el) => { btnRefs.current[i] = el }}
              onClick={() => handleNavClick(link.navId)}
              className={`relative z-[1] px-3.5 py-2 md:px-3 md:py-1.5 text-[0.75rem] md:text-[0.7rem] tracking-[0.1em] uppercase transition-colors duration-200 whitespace-nowrap cursor-pointer bg-transparent border-none ${
                activeNav === link.navId ? 'text-white/90' : 'text-white/50 hover:text-white/90'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Back to top — separator + button, width animates via max-width */}
          <div
            className="flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              maxWidth: atEnd ? 150 : 0,
              opacity: atEnd ? 1 : 0,
            }}
          >
            <div
              className="h-5 w-px mx-1 transition-opacity duration-500"
              style={{ background: 'rgba(140,180,255,0.15)', opacity: atEnd ? 1 : 0 }}
            />
            <button
              ref={backBtnRef}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative z-[1] flex items-center gap-1.5 px-3 py-1.5 text-[0.7rem] tracking-[0.1em] uppercase whitespace-nowrap cursor-pointer bg-transparent border-none text-white/50 hover:text-white/90 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
              Top
            </button>
          </div>
        </nav>
      </GlassSurface>
    </div>
    </div>
  )
}
