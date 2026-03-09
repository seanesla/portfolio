import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Props {
  onComplete: () => void
}

// Folding sprite sheet: 3x3 grid, 9 frames (uses first 6 for the fold sequence)
const FRAMES = [
  '0% 0%',    // frame 1: flat paper
  '50% 0%',   // frame 2: first fold
  '100% 0%',  // frame 3: second fold
  '0% 50%',   // frame 4: third fold
  '50% 50%',  // frame 5: fourth fold
  '100% 50%', // frame 6: airplane shape
]

export default function IntroAnimation({ onComplete }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (completedRef.current) return
    const frameEl = frameRef.current
    const overlay = overlayRef.current
    if (!frameEl || !overlay) return

    let currentFrame = 0
    let killed = false

    const interval = setInterval(() => {
      if (killed) return
      currentFrame++
      if (currentFrame < FRAMES.length) {
        frameEl.style.backgroundPosition = FRAMES[currentFrame]
      } else {
        clearInterval(interval)
        gsap.delayedCall(0.2, () => {
          if (killed) return
          gsap.to(frameEl, {
            y: -window.innerHeight * 0.6,
            rotation: -15,
            scale: 0.6,
            duration: 0.7,
            ease: 'power2.in',
            onComplete: () => {
              if (killed) return
              completedRef.current = true
              onCompleteRef.current()
              gsap.to(overlay, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                  overlay.style.pointerEvents = 'none'
                  overlay.style.display = 'none'
                },
              })
            },
          })
        })
      }
    }, 240)

    return () => {
      killed = true
      clearInterval(interval)
      gsap.killTweensOf(frameEl)
      gsap.killTweensOf(overlay)
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#060b18' }}
    >
      <div
        ref={frameRef}
        className="w-[180px] h-[98px] md:w-[250px] md:h-[136px]"
        style={{
          backgroundImage: 'url(/sprites/plane-intro-sheet.png)',
          backgroundSize: '300% 300%',
          backgroundPosition: '0% 0%',
        }}
      />
    </div>
  )
}
