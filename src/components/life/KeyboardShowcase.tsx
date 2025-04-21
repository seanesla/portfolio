import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function KeyboardShowcase() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const vidWrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Scroll animations
  useEffect(() => {
    const wrapper = wrapperRef.current
    const heading = headingRef.current
    const imgWrap = imgWrapRef.current
    const vidWrap = vidWrapRef.current
    const video = videoRef.current
    if (!wrapper || !heading || !imgWrap || !vidWrap) return

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(heading, { y: -40, filter: 'blur(8px)', opacity: 0 })
      gsap.set(imgWrap, { x: -150, rotateY: 35, opacity: 0, transformPerspective: 800 })
      gsap.set(vidWrap, { x: 150, rotateY: -35, opacity: 0, transformPerspective: 800 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: '+=1100',
          pin: true,
          scrub: 0.5,

          invalidateOnRefresh: true,
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
      tl.to(heading, { y: 0, filter: 'blur(0px)', opacity: 1, duration: 0.35 }, 0)
      tl.to(imgWrap, { x: 0, rotateY: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.05)
      tl.to(vidWrap, { x: 0, rotateY: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.1)

      // Hold phase (0.4 → 0.85) — content stays visible

      // Exit phase (0.85 → 1.0) — quick fade
      tl.to(imgWrap, { x: -40, opacity: 0, duration: 0.15, ease: 'power2.in' }, 0.85)
      tl.to(vidWrap, { x: 40, opacity: 0, duration: 0.15, ease: 'power2.in' }, 0.85)
      tl.to(heading, { filter: 'blur(6px)', opacity: 0, duration: 0.1 }, 0.88)
    }, wrapperRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapperRef} data-nav-id="keyboards" className="relative w-full h-[1px] overflow-visible">
      <div ref={innerRef} className="h-screen flex items-center justify-center z-[2]">
      <div className="w-full">
        <div className="ml-[8vw] mb-10">
          <h2
            ref={headingRef}
            className="text-[clamp(2rem,4vw,3rem)] font-extralight tracking-wide text-white/80"
          >
            Keyboards
          </h2>
        </div>

        <div className="flex items-start ml-[8vw] mr-[8vw]">
          <div ref={imgWrapRef} className="w-[30vw] -mt-8 shrink-0">
            <img
              src="/media/keyboards/gmmkpro.jpeg"
              alt="GMMK Pro"
              className="w-full rounded-xl shadow-2xl"
              loading="lazy"
            />
            <span className="text-sm tracking-[0.1em] uppercase text-white/40 font-light mt-4 block">
              GMMK Pro
            </span>
          </div>

          <div ref={vidWrapRef} className="w-[45vw] -ml-[6vw] mt-12 shrink-0">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                className="w-full object-cover"
                style={{ aspectRatio: '16/9' }}
                muted
                loop
                playsInline
                preload="none"
                poster="/media/keyboards/gmmkpro.jpeg"
              >
                <source src="/media/keyboards/showingoffmyfavkeyboard.mp4" type="video/mp4" />
              </video>
            </div>
            <span className="text-sm tracking-[0.1em] uppercase text-white/40 font-light mt-4 block">
              Daily Driver
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
