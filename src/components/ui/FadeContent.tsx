import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  delay?: number
}

export default function FadeContent({
  children,
  className = '',
  direction = 'up',
  distance = 40,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = ref.current!
      const from: Record<string, number> = { opacity: 0 }

      if (direction === 'up') from.y = distance
      if (direction === 'down') from.y = -distance
      if (direction === 'left') from.x = distance
      if (direction === 'right') from.x = -distance

      gsap.fromTo(el, from, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })
    return () => ctx.revert()
  }, [direction, distance, delay])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
