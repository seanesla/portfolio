import { useMemo } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'

interface Twinkle {
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

interface Particle {
  x: number
  startY: number
  size: number
  color: string
  driftX: number
  duration: number
  delay: number
}

const TWINKLE_COLORS = [
  'rgba(0, 255, 255, 0.9)',
  'rgba(0, 255, 170, 0.9)',
  'rgba(255, 255, 100, 0.9)',
  'rgba(255, 255, 255, 0.9)',
]

const PARTICLE_COLORS = [
  'rgba(0, 255, 255, 0.6)',
  'rgba(140, 180, 255, 0.6)',
  'rgba(255, 255, 255, 0.5)',
]

function generateTwinkles(count: number): Twinkle[] {
  const result: Twinkle[] = []
  for (let i = 0; i < count; i++) {
    result.push({
      x: 5 + Math.random() * 90,
      y: 35 + Math.random() * 55,
      size: 1.5 + Math.random() * 2.5,
      color: TWINKLE_COLORS[Math.floor(Math.random() * TWINKLE_COLORS.length)],
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
    })
  }
  return result
}

function generateParticles(count: number): Particle[] {
  const result: Particle[] = []
  for (let i = 0; i < count; i++) {
    result.push({
      x: 10 + Math.random() * 80,
      startY: 50 + Math.random() * 40,
      size: 1 + Math.random() * 2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      driftX: -20 + Math.random() * 40,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 6,
    })
  }
  return result
}

export default function CityOverlays({ visible }: { visible: boolean }) {
  const isMobile = useIsMobile()

  const twinkles = useMemo(
    () => generateTwinkles(isMobile ? 20 : 40),
    [isMobile]
  )
  const particles = useMemo(
    () => generateParticles(isMobile ? 8 : 15),
    [isMobile]
  )
  if (!visible) return null

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Twinkling lights */}
      {twinkles.map((t, i) => (
        <div
          key={`twinkle-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: t.size,
            height: t.size,
            backgroundColor: t.color,
            boxShadow: `0 0 ${t.size * 2}px ${t.color}`,
            animation: `city-twinkle ${t.duration}s ease-in-out ${t.delay}s infinite`,
          }}
        />
      ))}

      {/* Rising particles */}
      {particles.map((p, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.startY}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            ['--drift-x' as string]: `${p.driftX}px`,
            animation: `city-particle-rise ${p.duration}s ease-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
