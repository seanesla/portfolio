import { useState, useEffect } from 'react'
import type { Project } from './projectData'

const POLAROID_STYLES = [
  { topOffset: -20, right: '8%', rotate: 4 },
  { topOffset: 10, right: '5%', rotate: -3 },
  { topOffset: 40, right: '11%', rotate: 2 },
]

function TypewriterCaption({ text, delay = 600 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    setDisplayed('')
    setOpacity(0)

    // Ghost fade in first
    const fadeTimer = setTimeout(() => setOpacity(1), delay)

    // Then typewriter each character
    const timers: ReturnType<typeof setTimeout>[] = [fadeTimer]
    for (let i = 0; i < text.length; i++) {
      timers.push(
        setTimeout(() => {
          setDisplayed(text.slice(0, i + 1))
        }, delay + 200 + i * 80)
      )
    }

    return () => timers.forEach(clearTimeout)
  }, [text, delay])

  return (
    <span
      style={{
        opacity,
        transition: 'opacity 0.6s ease',
        fontFamily: "'Caveat', cursive",
        fontSize: 18,
        color: 'rgba(40, 35, 30, 0.85)',
        letterSpacing: 0.5,
        whiteSpace: 'nowrap',
      }}
    >
      {displayed}
      <span
        style={{
          opacity: displayed.length < text.length ? 1 : 0,
          transition: 'opacity 0.3s',
          marginLeft: 1,
        }}
      >
        |
      </span>
    </span>
  )
}

export default function ProjectMedia({ project }: { project: Project }) {
  const { media } = project
  if (!media) return null

  const hasVideo = !!media.video
  const hasImages = media.images && media.images.length > 0

  return (
    <div className="relative w-full flex items-center justify-center h-[30vh] md:h-[45vh]">
      {/* Video — centered primary */}
      {hasVideo && (
        <video
          src={media.video}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="relative z-[2] rounded-xl border border-white/[0.06] shadow-2xl shadow-black/40"
          style={{ maxHeight: '38vh', maxWidth: window.innerWidth < 768 ? '90%' : '55%', objectFit: 'contain' }}
        />
      )}

      {/* If only images and no video, show the first image centered */}
      {!hasVideo && hasImages && (
        <img
          src={media.images![0].src}
          alt=""
          className="relative z-[2] rounded-xl border border-white/[0.06] shadow-2xl shadow-black/40"
          style={{ maxHeight: '35vh', maxWidth: '80%', objectFit: 'contain' }}
        />
      )}

      {/* Polaroid thumbnails — top-right corner, desktop only */}
      {hasImages && media.images!.map((img, i) => {
        const s = POLAROID_STYLES[i % POLAROID_STYLES.length]
        return (
          <div
            key={img.src}
            className="absolute z-[3] hidden lg:block"
            style={{
              top: '50%',
              right: s.right,
              transform: `translateY(calc(-50% + ${s.topOffset}px)) rotate(${s.rotate}deg)`,
              // Aged paper: warm off-white gradient with slight unevenness
              background: `
                linear-gradient(
                  ${135 + i * 40}deg,
                  rgba(235, 228, 218, 0.97) 0%,
                  rgba(242, 238, 230, 0.95) 30%,
                  rgba(238, 232, 222, 0.96) 60%,
                  rgba(230, 224, 214, 0.94) 100%
                )
              `,
              padding: '10px 10px 36px 10px',
              borderRadius: 3,
              boxShadow: '0 4px 24px rgba(0,0,0,0.45), inset 0 0 30px rgba(0,0,0,0.04)',
              border: '1px solid rgba(180, 170, 155, 0.3)',
            }}
          >
            {/* Paper grain noise overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 3,
                opacity: 0.45,
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
              }}
            />
            {/* Subtle edge darkening on the paper */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 3,
                pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(160,145,120,0.08) 100%)',
              }}
            />
            <img
              src={img.src}
              alt=""
              style={{
                position: 'relative',
                width: 400,
                height: 300,
                objectFit: 'cover',
                display: 'block',
                borderRadius: 2,
              }}
            />
            {/* Caption in the thick bottom border */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 0,
                right: 0,
                textAlign: 'center',
              }}
            >
              <TypewriterCaption text={img.caption} delay={800 + i * 400} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
