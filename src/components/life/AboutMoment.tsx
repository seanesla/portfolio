import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CardSwap, { Card } from '../ui/CardSwap'
import TerminalAbout from '../ui/TerminalAbout'

gsap.registerPlugin(ScrollTrigger)

export default function AboutMoment() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [holdActive, setHoldActive] = useState(false)
  const holdTriggeredRef = useRef(false)

  useEffect(() => {
    const section = sectionRef.current
    const photo = photoRef.current
    const card = cardRef.current
    const video = videoRef.current
    if (!section || !photo || !card) return

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(photo, { x: -120, rotateZ: -3, opacity: 0 })
      gsap.set(card, { x: 120, rotateZ: 2, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=2000',
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
  }, [])

  return (
    <div ref={sectionRef} data-nav-id="about" className="relative h-[1px] overflow-visible">
      <div ref={innerRef} className="h-screen flex items-center relative z-[2]">
      {/* Video — bleeds left */}
      <div ref={photoRef} className="absolute left-[5vw] top-1/2 -translate-y-1/2 w-[42vw] h-[55vh] overflow-hidden rounded-2xl">
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
          width={180}
          height={230}
          cardDistance={30}
          verticalDistance={20}
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
      <div ref={cardRef} className="ml-auto mr-[5vw] md:mr-[8vw] w-[45vw] md:w-[40vw] h-[55vh] relative z-[3]">
        <TerminalAbout startAnimation={holdActive} />
      </div>
      </div>
    </div>
  )
}
