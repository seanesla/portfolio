import { useRef, type ReactNode, type MouseEvent } from 'react'
import { gsap } from 'gsap'
import { useIsTouchDevice } from '../../hooks/useIsMobile'

interface Props {
  children: ReactNode
  strength?: number
  className?: string
}

export default function Magnet({ children, strength = 0.3, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouchDevice()

  function handleMove(e: MouseEvent) {
    const el = ref.current!
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' })
  }

  function handleLeave() {
    gsap.to(ref.current!, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={isTouch ? undefined : handleMove}
      onMouseLeave={isTouch ? undefined : handleLeave}
    >
      {children}
    </div>
  )
}
