import { useRef, useEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: ReactNode
  className?: string
  strength?: number
}

export default function ScrollFloat({ children, className = '', strength = 50 }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapperRef.current,
        { y: strength, opacity: 0 },
        {
          y: -strength * 0.3,
          opacity: 1,
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 90%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      )
    }, wrapperRef)

    return () => ctx.revert()
  }, [strength])

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  )
}
