import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CardSwap, { Card } from '../ui/CardSwap'
import TerminalAbout from '../ui/TerminalAbout'
import { useIsMobile } from '../../hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

export default function AboutMoment() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [holdActive, setHoldActive] = useState(false)
  const holdTriggeredRef = useRef(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const section = sectionRef.current
    const photo = photoRef.current
    const card = cardRef.current
    const video = videoRef.current
    if (!section || !photo || !card) return

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(photo, { x: isMobile ? -60 : -120, rotateZ: -3, opacity: 0 })
      gsap.set(card, { x: isMobile ? 60 : 120, rotateZ: 2, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: isMobile ? '+=1200' : '+=2000',
          pin: true,
          scrub: 0.5,

          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress >= 0.4 && !holdTriggeredRef.current) {
              holdTriggeredRef.current = true
              setHoldActive(true)
            }
          },
          onToggle: (self) => {
            if (!video) return
            if (self.isActive) video.play().catch(() => {})
            else video.pause()
          },
          onLeave: () => {
            if (innerRef.current) innerRef.current.style.pointerEvents = 'none'
          },
          onEnterBack: () => {
            if (innerRef.current) innerRef.current.style.pointerEvents = ''
          },
        },
      })

      // Enter phase (0 → 0.4)
      tl.to(photo, { x: 0, rotateZ: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
      tl.to(card, { x: 0, rotateZ: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.05)

      // Hold phase (0.4 → 0.85) — terminal animation plays (time-based)

      // Exit phase (0.85 → 1.0) — quick fade
      tl.to(photo, { y: -40, opacity: 0, duration: 0.15, ease: 'power2.in' }, 0.85)
      tl.to(card, { y: 40, opacity: 0, duration: 0.15, ease: 'power2.in' }, 0.85)
    }, sectionRef)

    return () => ctx.revert()
  }, [isMobile])

  return (
    <div ref={sectionRef} data-nav-id="about" className="relative h-[1px] overflow-visible">
      <div ref={innerRef} className="h-screen flex flex-col md:flex-row items-center relative z-[2]">
      {/* Video — bleeds left */}
      <div ref={photoRef} className="relative w-[85vw] h-[35vh] md:absolute md:left-[5vw] md:top-1/2 md:-translate-y-1/2 md:w-[42vw] md:h-[55vh] overflow-hidden rounded-2xl mt-[10vh] md:mt-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-2xl"
          loop
          muted
          playsInline
          preload="none"
        >
          <source src="/media/flying-montage.mp4" type="video/mp4" />
        </video>
        <CardSwap
          width={isMobile ? 120 : 180}
          height={isMobile ? 155 : 230}
          cardDistance={isMobile ? 15 : 30}
          verticalDistance={isMobile ? 10 : 20}
          delay={2000}
          pauseOnHover={true}
          easing="linear"
        >
          <Card>
            <img src="/media/photoofme.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/photoofme2.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/photoofme3.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/photoofme4.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/melockedinduringhackathon.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
        </CardSwap>
      </div>

      {/* Terminal card — offset right, overlapping photo */}
      <div ref={cardRef} className="w-[90vw] h-[40vh] md:ml-auto md:mr-[5vw] lg:mr-[8vw] md:w-[45vw] lg:w-[40vw] md:h-[55vh] relative z-[3] overflow-hidden">
        <TerminalAbout startAnimation={holdActive} />
      </div>
      </div>
    </div>
  )
}
