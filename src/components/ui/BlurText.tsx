import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Props {
  text: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  animate?: boolean
  onComplete?: () => void
}

export default function BlurText({ text, className = '', style, delay = 0, animate = true, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animate) return
    const chars = containerRef.current!.querySelectorAll('.blur-char')
    gsap.fromTo(
      chars,
      { opacity: 0, filter: 'blur(12px)', y: 20 },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: 'power2.out',
        delay,
        onComplete: () => {
          chars.forEach((c) => { (c as HTMLElement).style.willChange = 'auto' })
          onComplete?.()
        },
      }
    )
  }, [animate, delay, onComplete])

  return (
    <div ref={containerRef} className={className} style={style} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="blur-char inline-block opacity-0"
          style={{ willChange: 'filter, opacity, transform' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  )
}
