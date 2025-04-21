import { useEffect } from 'react'
import { gsap } from 'gsap'
import BlurText from './ui/BlurText'
import Magnet from './ui/Magnet'
import DecryptedText from './ui/DecryptedText'

interface Props {
  visible: boolean
}

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    href: 'https://github.com/seanesla',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/seanesla/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'Devpost',
    href: 'https://devpost.com/bayshore',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M6.002 1.61L0 12.004 6.002 22.39h11.996L24 12.004 17.998 1.61zm1.593 4.084h3.947c3.605 0 6.276 1.695 6.276 6.31 0 4.436-3.21 6.302-6.456 6.302H7.595zm2.517 2.449v7.714h1.241c2.646 0 3.862-1.55 3.862-3.861.009-2.569-1.096-3.853-3.767-3.853z" />
      </svg>
    ),
  },
]

export default function HeroSection({ visible }: Props) {
  useEffect(() => {
    if (!visible) return
    // Stagger in subtitle and social links after blur text finishes
    const tl = gsap.timeline({ delay: 0.8 })
    tl.to('.hero-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    })
      .to('.hero-social', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.2')
      .to('.hero-scroll-indicator', {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.1')
    return () => { tl.kill() }
  }, [visible])

  return (
    <section className="hero-content relative z-10 h-screen flex flex-col items-center justify-center text-center px-6 pb-[8vh]" style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <BlurText
        text="Sean Esla"
        className="text-[clamp(3rem,8vw,6rem)] font-semibold tracking-tight text-white/90 mb-3"
        animate={visible}
        delay={0.2}
      />

      <p
        className="hero-subtitle text-[0.8rem] font-light tracking-[0.15em] uppercase text-white/45 mb-8 opacity-0 translate-y-[10px]"
      >
        Student &middot; AI Researcher &middot; Hackathon Builder &middot; Private Pilot
      </p>

      <div className="hero-social flex items-center gap-6 mt-8 opacity-0 translate-y-[10px]">
        {SOCIAL_LINKS.map((link) => (
          <Magnet key={link.name} strength={0.4}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/45 text-[0.8rem] tracking-[0.05em] transition-all duration-300 hover:text-[rgba(200,220,255,0.9)] hover:[text-shadow:0_0_12px_rgba(140,180,255,0.3)]"
            >
              {link.icon}
              {link.name}
            </a>
          </Magnet>
        ))}
      </div>

      {/* Scroll indicator — shooting star + decrypted text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Magnet strength={0.3}>
          <div
            className="hero-scroll-indicator opacity-0 flex flex-col items-center gap-3 cursor-pointer"
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <div className="relative w-[1px] h-[40px] bg-white/[0.06] rounded-full overflow-hidden">
              <div className="shooting-star-dot" />
            </div>
            <DecryptedText
              text="EXPLORE"
              speed={80}
              revealDirection="start"
              className="text-[0.6rem] tracking-[0.25em] text-white/30 font-light"
            />
          </div>
        </Magnet>
      </div>
    </section>
  )
}
