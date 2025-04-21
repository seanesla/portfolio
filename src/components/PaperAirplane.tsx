import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Sprite frame mapping — sideLeft/sideRight swapped to match actual nose direction
const FRAMES = {
  bankLeft: '/sprites/plane-bank-left.png',
  bankRight: '/sprites/plane-turn-right.png',
  sideLeft: '/sprites/plane-side-right.png',
  sideRight: '/sprites/plane-side-left.png',
  upperRight: '/sprites/plane-upper-right.png',
  turnLeft: '/sprites/plane-turn-left.png',
  turnRight: '/sprites/plane-turn-right.png',
  front: '/sprites/plane-front.png',
}

type FrameKey = keyof typeof FRAMES

// Preload all frames
Object.values(FRAMES).forEach((src) => {
  const img = new Image()
  img.src = src
})

/** Measure the "Sean Esla" text and return the plane's center-point in
 *  viewport pixels (for use with position:fixed + translate(-50%,-50%)).
 *  Desktop: to the left of the first character, vertically centered.
 *  Mobile:  above the text, horizontally centered. */
function getParkPos(scale: number) {
  // BlurText renders the "Sean Esla" heading as the first child of .hero-content
  const container = document.querySelector('.hero-content')?.firstElementChild
  if (!container) {
    return { left: window.innerWidth * 0.3, top: window.innerHeight * 0.4 }
  }
  const rect = container.getBoundingClientRect()
  const isMobile = window.innerWidth < 768
  const renderedW = 120 * scale
  const renderedH = 80 * scale

  if (isMobile) {
    return {
      left: rect.left + rect.width / 2,
      top: rect.top - 12 - renderedH / 2,
    }
  }

  // Desktop: park just to the left of the text, vertically centered
  const gap = 10
  return {
    left: rect.left - gap - renderedW / 2,
    top: rect.top + rect.height / 2,
  }
}

export default function PaperAirplane({ started = false }: { started?: boolean }) {
  const frameRef = useRef<FrameKey>('turnLeft')
  const imgRef = useRef<HTMLImageElement>(null)
  const airplaneRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  const setFrame = (key: FrameKey) => {
    if (frameRef.current === key) return
    frameRef.current = key
    if (imgRef.current) imgRef.current.src = FRAMES[key]
  }
  const idleTweenRef = useRef<gsap.core.Tween | null>(null)
  const parkPosRef = useRef({ left: 0, top: 0 })
  const recalcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startIdleBob = (el: HTMLElement) => {
    stopIdleBob()
    idleTweenRef.current = gsap.to(el, {
      y: -4,
      duration: 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }

  const stopIdleBob = () => {
    if (idleTweenRef.current) {
      idleTweenRef.current.kill()
      idleTweenRef.current = null
    }
  }

  // Set initial position on mount (hidden, off-screen)
  useEffect(() => {
    const el = airplaneRef.current
    if (!el) return
    const isMobile = window.innerWidth < 768
    const scale = isMobile ? 0.4 : 0.6
    gsap.set(el, {
      top: '-15%',
      left: isMobile ? '70%' : '80%',
      xPercent: -50,
      yPercent: -50,
      scale: scale * 0.8,
      opacity: 0,
    })
  }, [])

  // Entrance animation — waits for `started` prop
  useEffect(() => {
    if (!started) return
    const el = airplaneRef.current
    if (!el) return
    const isMobile = window.innerWidth < 768
    const scale = isMobile ? 0.4 : 0.6

    setFrame('turnLeft')
    const flyTweenRef = { current: null as gsap.core.Tween | null }

    const entranceTl = gsap.timeline()

    entranceTl
      .to(el, {
        opacity: 1,
        duration: 0.3,
      })
      .call(() => {
        // Measure text position — BlurText is animating by now
        const park = getParkPos(scale)
        flyTweenRef.current = gsap.to(el, {
          top: park.top,
          left: park.left,
          scale,
          rotation: 0,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: function () {
            if (this.progress() > 0.85) setFrame('turnLeft')
          },
          onComplete: () => {
            parkPosRef.current = getParkPos(scale)
            setEntered(true)
            setFrame('turnLeft')
            startIdleBob(el)
          },
        })
      })

    return () => {
      entranceTl.kill()
      flyTweenRef.current?.kill()
    }
  }, [started])

  // Resize handler — reposition when parked
  useEffect(() => {
    if (!entered) return
    const el = airplaneRef.current
    if (!el) return

    const onResize = () => {
      if (!idleTweenRef.current) return // only when parked/bobbing
      const isMobile = window.innerWidth < 768
      const scale = isMobile ? 0.4 : 0.6
      const park = getParkPos(scale)
      parkPosRef.current = park
      gsap.set(el, { left: park.left, top: park.top })
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [entered])

  // Scroll-driven choreography — 2 sections: Hero + Life
  useEffect(() => {
    if (!entered) return
    const el = airplaneRef.current
    if (!el) return
    const isMobile = window.innerWidth < 768
    const scale = isMobile ? 0.4 : 0.6

    // Hero → Life Section transition
    const heroToLife = ScrollTrigger.create({
      trigger: document.querySelector('.hero-content'),
      start: 'top top',
      end: '+=100%',
      scrub: 0.5,

      onLeave: () => {
        // Fires immediately at boundary — guarantees airplane is hidden
        // even if scrub hasn't caught up (prevents flash in AboutMoment)
        stopIdleBob()
        gsap.set(el, { left: '-20%', top: '120%', opacity: 0, y: 0 })
      },

      onEnterBack: () => {
        // Recalculate park position once when scrolling back into hero range.
        // Delayed recalc lets the iris-wipe snap (0.2–0.4s) settle first.
        const recalc = () => {
          parkPosRef.current = getParkPos(scale)
          if (idleTweenRef.current && el) {
            gsap.set(el, { top: parkPosRef.current.top, left: parkPosRef.current.left })
          }
        }
        recalc()
        if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current)
        recalcTimerRef.current = setTimeout(recalc, 500)
      },

      onLeaveBack: () => {
        // Safety net: user scrolled above trigger start — ensure airplane is parked
        const park = parkPosRef.current
        if (!idleTweenRef.current) {
          setFrame('turnLeft')
          gsap.set(el, { top: park.top, left: park.left, scale, rotation: 0, opacity: 1, y: 0 })
          startIdleBob(el)
        }
      },

      onUpdate: (self) => {
        const p = self.progress
        const dir = self.direction  // 1 = down, -1 = up

        if (p < 0.02) {
          if (!idleTweenRef.current) {
            const park = parkPosRef.current
            setFrame('turnLeft')
            gsap.set(el, {
              top: park.top,
              left: park.left,
              scale,
              rotation: 0,
              opacity: 1,
              y: 0,
            })
            startIdleBob(el)
          }
        } else if (p < 0.2) {
          // Continue diagonally bottom-left (same direction it flew in from)
          const park = parkPosRef.current
          stopIdleBob()
          setFrame(dir === -1 ? 'turnRight' : 'turnLeft')
          const t = (p - 0.02) / 0.18
          gsap.set(el, {
            opacity: 1 - t,
            y: 0,
            top: park.top + t * window.innerHeight * 0.5,
            left: park.left - t * window.innerWidth * 0.4,
            scale: scale * (1 - t * 0.5),
            rotation: dir === -1 ? -10 * t : 10 * t,
          })
        } else {
          // Off screen bottom-left — hidden
          stopIdleBob()
          gsap.set(el, {
            left: '-20%',
            top: '120%',
            opacity: 0,
            y: 0,
          })
        }
      },
    })

    return () => {
      heroToLife.kill()
      stopIdleBob()
      if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current)
    }
  }, [entered])

  return (
    <div
      ref={airplaneRef}
      className="fixed z-50 pointer-events-none"
      style={{
        width: '120px',
        height: '80px',
      }}
    >
      <img
        ref={imgRef}
        src={FRAMES[frameRef.current]}
        alt=""
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
      />
    </div>
  )
}
