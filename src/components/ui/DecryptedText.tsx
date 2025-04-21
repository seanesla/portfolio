import { useEffect, useRef, useState } from 'react'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

interface Props {
  text: string
  speed?: number
  className?: string
  revealDirection?: 'start' | 'end' | 'random'
}

export default function DecryptedText({
  text,
  speed = 50,
  className = '',
  revealDirection = 'start',
}: Props) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [displayChars, setDisplayChars] = useState<string[]>(() =>
    [...text].map((ch) => (ch === ' ' ? ' ' : randomChar()))
  )
  const revealedRef = useRef<boolean[]>(Array(text.length).fill(false))
  const [, forceRender] = useState(0)
  const hasStartedRef = useRef(false)

  // Reset when text changes
  useEffect(() => {
    revealedRef.current = Array(text.length).fill(false)
    setDisplayChars([...text].map((ch) => (ch === ' ' ? ' ' : randomChar())))
    hasStartedRef.current = false
  }, [text])

  // Build reveal order
  function buildRevealOrder(): number[] {
    const indices: number[] = []
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') indices.push(i)
    }
    if (revealDirection === 'end') {
      indices.reverse()
    } else if (revealDirection === 'random') {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
    }
    return indices
  }

  // IntersectionObserver to trigger decoding
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true
          forceRender((n) => n + 1)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Scramble + reveal loop
  useEffect(() => {
    if (!hasStartedRef.current) return

    const order = buildRevealOrder()
    let step = 0
    let scrambleTick = 0

    const interval = setInterval(() => {
      scrambleTick++

      // Reveal next character at the configured speed
      if (scrambleTick % Math.max(1, Math.round(speed / 30)) === 0 && step < order.length) {
        const idx = order[step]
        revealedRef.current[idx] = true
        step++
      }

      // Check if done
      const allDone = revealedRef.current.every((r, i) => r || text[i] === ' ')
      if (allDone) {
        setDisplayChars([...text])
        clearInterval(interval)
        return
      }

      // Update display: resolved chars show real text, others scramble
      setDisplayChars((prev) => {
        const next = [...prev]
        for (let i = 0; i < text.length; i++) {
          if (revealedRef.current[i] || text[i] === ' ') {
            next[i] = text[i]
          } else {
            next[i] = randomChar()
          }
        }
        return next
      })
    }, 30)

    return () => clearInterval(interval)
  }, [hasStartedRef.current, text, speed, revealDirection])

  return (
    <span ref={containerRef} className={className}>
      {displayChars.map((char, i) => (
        <span key={i}>
          {char}
        </span>
      ))}
    </span>
  )
}
