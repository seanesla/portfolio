import type { Project } from './projectData'
import Magnet from '../ui/Magnet'
import DecryptedText from '../ui/DecryptedText'

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const DevpostIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M6.002 1.61L0 12.004 6.002 22.39h11.996L24 12.004 17.998 1.61zm1.593 4.084h3.947c3.605 0 6.276 1.695 6.276 6.31 0 4.436-3.21 6.302-6.456 6.302H7.595zm2.517 2.449v7.714h1.241c2.646 0 3.862-1.55 3.862-3.861.009-2.569-1.096-3.853-3.767-3.853z" />
  </svg>
)

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

interface Props {
  project: Project
}

export default function ProjectCard({ project }: Props) {
  const linkEntries: { label: string; href: string; icon: React.ReactNode }[] = []

  if (project.links.github) {
    linkEntries.push({ label: 'GitHub', href: project.links.github, icon: <GitHubIcon /> })
  }
  if (project.links.devpost) {
    linkEntries.push({ label: 'Devpost', href: project.links.devpost, icon: <DevpostIcon /> })
  }
  if (project.links.live) {
    linkEntries.push({ label: 'Live', href: project.links.live, icon: <LinkIcon /> })
  }
  if (project.links.demo) {
    linkEntries.push({ label: 'Demo', href: project.links.demo, icon: <LinkIcon /> })
  }

  const isWinner = project.isWinner

  return (
    <div
      className={`group relative rounded-2xl h-[340px] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
        isWinner
          ? 'border border-amber-300/[0.08] hover:border-amber-300/[0.15] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(255,200,50,0.04)]'
          : 'border border-white/[0.04] hover:border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),0_0_15px_-5px_rgba(140,180,255,0.03)]'
      }`}
      style={{
        background: isWinner
          ? 'linear-gradient(to bottom, #161210 0%, #0d1220 40%, #090e1a 100%)'
          : 'linear-gradient(to bottom, #0f1525 0%, #0d1220 40%, #090e1a 100%)',
        animation: isWinner ? 'gold-glow-pulse 4s ease-in-out infinite' : undefined,
      }}
    >
      {/* Top edge glow line — sharp 1px */}
      <div
        className={`absolute top-0 left-0 right-0 h-px transition-opacity duration-300 ${
          isWinner
            ? 'opacity-70 group-hover:opacity-100'
            : 'opacity-50 group-hover:opacity-80'
        }`}
        style={{
          background: isWinner
            ? 'linear-gradient(90deg, transparent 5%, rgba(255,200,50,0.5) 30%, rgba(255,220,100,0.8) 50%, rgba(255,200,50,0.5) 70%, transparent 95%)'
            : 'linear-gradient(90deg, transparent 10%, rgba(140,180,255,0.3) 35%, rgba(140,180,255,0.6) 50%, rgba(140,180,255,0.3) 65%, transparent 90%)',
          backgroundSize: isWinner ? '200% 100%' : undefined,
          animation: isWinner ? 'edge-shimmer 8s ease-in-out infinite' : undefined,
        }}
      />

      {/* Soft top glow — diffused beneath the line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[60px] pointer-events-none transition-opacity duration-300 ${
          isWinner
            ? 'opacity-60 group-hover:opacity-90'
            : 'opacity-40 group-hover:opacity-70'
        }`}
        style={{
          background: isWinner
            ? 'linear-gradient(to bottom, rgba(255,200,50,0.06) 0%, transparent 100%)'
            : 'linear-gradient(to bottom, rgba(140,180,255,0.04) 0%, transparent 100%)',
        }}
      />

      {/* Surface noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg width="100%" height="100%">
          <filter id={`noise-${project.name.replace(/\s+/g, '-')}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#noise-${project.name.replace(/\s+/g, '-')})`} />
        </svg>
      </div>

      {/* Winner left accent — gold vertical line */}
      {isWinner && (
        <div
          className="absolute top-0 left-0 w-px h-full pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,200,50,0.3) 0%, rgba(255,200,50,0.08) 50%, transparent 100%)',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-[1] flex flex-col h-full p-10 md:p-14">
        {isWinner && project.award && (
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/[0.12] bg-amber-300/[0.03] px-3 py-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-300/80">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <DecryptedText
                text={project.award}
                speed={60}
                revealDirection="start"
                className="text-[0.65rem] tracking-[0.12em] uppercase text-amber-300/80 font-medium"
              />
            </div>
          </div>
        )}

        <h3
          className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-extralight tracking-wide text-white/90 mb-1"
          style={{
            textShadow: isWinner
              ? '0 0 20px rgba(255,200,50,0.08)'
              : '0 0 20px rgba(140,180,255,0.06)',
          }}
        >
          {project.name}
        </h3>

        <p className="text-[0.7rem] tracking-[0.12em] uppercase text-white/40 mb-5">
          {project.hackathon} &middot; {project.date}
        </p>

        <p className="text-[0.9rem] leading-relaxed text-white/60 font-light mb-6 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-[0.6rem] tracking-[0.08em] uppercase text-white/30 border border-white/[0.08] rounded-full px-2.5 py-1 transition-colors duration-300 group-hover:text-white/40 group-hover:border-white/[0.12]"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-5">
          {linkEntries.map((link) => (
            <Magnet key={link.label} strength={0.3}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-white/45 text-[0.75rem] tracking-[0.05em] transition-all duration-300 hover:text-[rgba(200,220,255,0.9)] hover:[text-shadow:0_0_12px_rgba(140,180,255,0.3)]"
              >
                {link.icon}
                {link.label}
              </a>
            </Magnet>
          ))}
        </div>
      </div>
    </div>
  )
}
