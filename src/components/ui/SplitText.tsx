import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  text: string
  className?: string
  delay?: number
  duration?: number
  splitBy?: 'characters' | 'words'
}

export default function SplitText({
  text,
  className = '',
  delay = 0.03,
  duration = 0.6,
  splitBy = 'characters',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const spans = containerRef.current!.querySelectorAll('.split-item')
      gsap.fromTo(
        spans,
        { opacity: 0, y: 20, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration,
          stagger: delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [text, delay, duration, splitBy])

  const items =
    splitBy === 'characters' ? text.split('') : text.split(/(\s+)/)

  return (
    <div ref={containerRef} className={className} aria-label={text}>
      {items.map((item, i) => {
        if (splitBy === 'characters') {
          return (
            <span
              key={i}
              className="split-item inline-block opacity-0"
              style={{ willChange: 'filter, opacity, transform' }}
            >
              {item === ' ' ? '\u00A0' : item}
            </span>
          )
        }

        if (/^\s+$/.test(item)) {
          return (
            <span key={i} className="inline-block">
              {'\u00A0'}
            </span>
          )
        }

        return (
          <span
            key={i}
            className="split-item inline-block opacity-0"
            style={{ willChange: 'filter, opacity, transform' }}
          >
            {item}
          </span>
        )
      })}
    </div>
  )
}
