import { useEffect, useRef, useState } from 'react'
import ASCIIText from './ui/ASCIIText'
import BlurText from './ui/BlurText'

export default function TheEndSection() {
  const blurRef = useRef<HTMLDivElement>(null)
  const [blurVisible, setBlurVisible] = useState(false)

  // Trigger BlurText animation only when it scrolls into view
  useEffect(() => {
    if (!blurRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBlurVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(blurRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section data-end-section>
      {/* Dark void gradient spacer */}
      <div
        className="h-[60vh]"
        style={{
          background: `linear-gradient(to bottom,
            rgba(6, 11, 24, 0) 0%,
            rgba(6, 11, 24, 0.3) 15%,
            rgba(6, 11, 24, 0.7) 35%,
            rgba(0, 0, 0, 0.9) 65%,
            #000000 100%
          )`,
        }}
      />

      {/* "you've reached" + ASCII "the end" */}
      <div className="relative z-10 h-[15vh] bg-black">
        {/* Inner wrapper is taller so ASCII text renders large, but parent clips layout height */}
        <div className="absolute inset-x-0 top-0 h-[50vh] pointer-events-auto">
          <ASCIIText text="the end" />
        </div>
        <div
          ref={blurRef}
          className="absolute inset-x-0 top-[-2rem] z-10 flex justify-center pointer-events-none"
        >
          <BlurText
            text="you've reached"
            animate={blurVisible}
            className="text-3xl md:text-5xl text-white/60 tracking-[0.25em] uppercase"
            style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 200 }}
          />
        </div>
      </div>

      {/* City skyline */}
      <div className="relative bg-black overflow-hidden max-h-[70vh]">
        <img
          src="/media/cityatbottomofwebsitepage.png"
          alt=""
          className="w-full block"
        />
      </div>
    </section>
  )
}
