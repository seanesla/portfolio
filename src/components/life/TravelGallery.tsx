import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ThreeDHoverGallery from '../ui/ThreeDHoverGallery'
import { useIsMobile } from '../../hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

const ALL_PLACES = [
  { src: '/media/travelstuffs/russiaworldcup2018iranvsportugal.jpeg', label: 'Russia World Cup 2018', sublabel: 'Saransk, Russia' },
  { src: '/media/travelstuffs/dubai.jpeg', label: 'Dubai', sublabel: 'United Arab Emirates' },
  { src: '/media/travelstuffs/nyc.jpeg', label: 'New York City', sublabel: 'United States' },
  { src: '/media/travelstuffs/cozumel.jpeg', label: 'Cozumel', sublabel: 'Mexico' },
  { src: '/media/travelstuffs/bahiadebanderas.jpeg', label: 'Bahia de Banderas', sublabel: 'Mexico' },
  { src: '/media/travelstuffs/pebblebeach.jpeg', label: 'Pebble Beach', sublabel: 'California' },
  { src: '/media/travelstuffs/washingtondc.jpeg', label: 'Washington, D.C.', sublabel: 'United States' },
  { src: '/media/travelstuffs/chelseastadium.jpeg', label: 'Chelsea Stadium', sublabel: 'London, England' },
]

export default function TravelGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const galleryWrapRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // GSAP scroll-driven enter/hold/exit
  useEffect(() => {
    const wrapper = wrapperRef.current
    const heading = headingRef.current
    const galleryWrap = galleryWrapRef.current
    if (!wrapper || !heading || !galleryWrap) return

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(heading, { y: -40, filter: 'blur(8px)', opacity: 0 })
      gsap.set(galleryWrap, { y: 60, scale: 0.95, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: isMobile ? '+=600' : '+=1000',
          pin: true,
          scrub: 0.5,

          invalidateOnRefresh: true,
          onLeave: () => {
            if (innerRef.current) innerRef.current.style.pointerEvents = 'none'
          },
          onEnterBack: () => {
            if (innerRef.current) innerRef.current.style.pointerEvents = ''
          },
        },
      })

      // Enter phase (0 -> 0.35)
      tl.to(heading, { y: 0, filter: 'blur(0px)', opacity: 1, duration: 0.3 }, 0)
      tl.to(galleryWrap, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.05)

      // Hold phase (0.35 -> 0.85) — user interacts with hover gallery

      // Exit phase (0.85 -> 1.0)
      tl.to(galleryWrap, { y: -30, opacity: 0, duration: 0.15, ease: 'power2.in' }, 0.85)
      tl.to(heading, { filter: 'blur(6px)', opacity: 0, duration: 0.1 }, 0.88)
    }, wrapperRef)

    return () => ctx.revert()
  }, [isMobile])

  return (
    <div ref={wrapperRef} data-nav-id="travel" className="relative w-full h-[1px] overflow-visible">
      <div ref={innerRef} className="h-screen flex flex-col items-center justify-center z-[2]">
        <div className="w-[90vw]">
          <h2
            ref={headingRef}
            className="text-[clamp(2rem,4vw,3rem)] font-extralight tracking-wide text-white/80 mb-8 ml-[2vw]"
          >
            Places I've Been
          </h2>
          <div ref={galleryWrapRef}>
            <ThreeDHoverGallery items={ALL_PLACES} />
          </div>
        </div>
      </div>
    </div>
  )
}
